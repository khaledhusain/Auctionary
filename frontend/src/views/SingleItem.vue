<template>
  <div class="detail-page">
    <div class="detail-header">
      <h1 class="detail-title">Item {{ itemId }}</h1>
    </div>

    <div class="detail-divider"></div>

    <p v-if="loading" class="muted">Loading...</p>
    <p v-if="error" class="form-error">{{ error }}</p>

    <div v-if="item && !loading" class="detail-box">
      <div class="detail-row">
        <div class="detail-label">Name</div>
        <div class="detail-value">{{ item.name }}</div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Description</div>
        <div class="detail-value">{{ item.description }}</div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Current Bid</div>
        <div class="detail-value"><strong>{{ formatCurrency(item.current_bid) }}</strong></div>
      </div>

      <div class="detail-row" v-if="item.end_date">
        <div class="detail-label">End Date</div>
        <div class="detail-value">{{ formatIsoDate(item.end_date) }}</div>
      </div>
    </div>

    <div class="section-divider"></div>

    <div class="section">
      <h2 class="section-title">Place a bid</h2>

      <form class="inline-form" @submit.prevent="submitBid">
        <input
          class="form-input"
          type="number"
          min="1"
          step="1"
          v-model="bid_amount"
          placeholder="Enter bid amount"
        />
        <button class="btn" type="submit">Bid</button>
      </form>

      <p v-if="bid_success" class="form-success">{{ bid_success }}</p>
    </div>

    <div class="section-divider"></div>

    <div class="section">
      <h2 class="section-title">Bid history</h2>

      <p v-if="bids_loading" class="muted">Loading bids...</p>
      <p v-if="bids_error" class="form-error">{{ bids_error }}</p>

      <div v-if="!bids_loading && !bids_error" class="list-box">
        <div
          class="list-row"
          v-for="b in bids"
          :key="`${b.user_id}-${b.amount}-${b.timestamp || ''}`"
        >
          <div class="list-main">
            <span class="list-strong">{{ b.first_name }} {{ b.last_name }}</span>
            <span class="muted">bid</span>
            <span class="list-strong">{{ b.amount }}</span>
          </div>
          <div class="list-meta" v-if="b.timestamp">{{ formatTime(b.timestamp) }}</div>
        </div>

        <div class="muted" v-if="bids.length === 0">No bids yet.</div>
      </div>
    </div>

    <div class="section-divider"></div>

    <div class="section">
      <h2 class="section-title">Questions</h2>

      <p v-if="qError" class="form-error">{{ qError }}</p>

      <div v-if="isLoggedIn" class="q-ask">
        <input class="form-input" v-model="newQuestion" placeholder="Ask a question..." />
        <button class="btn" type="button" @click="submitQuestion">Ask</button>
      </div>

      <div v-else class="muted">
        You must be logged in to ask/answer questions.
      </div>

      <div class="list-box">
          <div class="q-row" v-for="q in questions" :key="q.question_id">
            <div class="q-question">
              <span class="list-strong">{{ q.question_text || q.question }}</span>
            </div>

            <div class="q-answer" v-if="q.answer_text || q.answer">
              <div class="q-answer-label">Answer:</div>
              <div class="q-answer-text">{{ q.answer_text || q.answer }}</div>
            </div>

            <div v-if="isLoggedIn && !(q.answer_text || q.answer)" class="q-reply">
              <input
                class="form-input"
                v-model="answerDrafts[q.question_id]"
                placeholder="Write an answer..."
              />
              <button class="btn" type="button" @click="submitAnswer(q.question_id)">
                Answer
              </button>
            </div>
          </div>
        <div class="muted" v-if="questions.length === 0">No questions yet.</div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../services/api";

export default {
  data() {
    return {
      itemId: null,
      item: null,
      loading: false,
      error: "",
      bid_amount: "",
      bid_success: "",
      bids: [],
      bids_loading: false,
      bids_error: "",
      questions: [],
      newQuestion: "",
      answerDrafts: {},
      qError: "",
    };
  },

  computed: {
    isLoggedIn() {
      return !!localStorage.getItem("session_token");
    },
    itemId() {
      return this.$route.params.id;
    },
  },

  async mounted() {
    this.itemId = this.$route.params.id;
    await this.loadItem();
    await this.loadBids();
    await this.loadQuestions();
  },

  methods: {
    async loadItem() {
      this.loading = true;
      this.error = "";

      try {
        const res = await fetch(`http://localhost:3333/item/${this.itemId}`);
        const data = await res.json();

        if (!res.ok) {
          this.error = data?.error_message || `Request failed (${res.status})`;
          return;
        }

        this.item = data;
      } catch {
        this.error = "Could not connect to backend";
      } finally {
        this.loading = false;
      }
    },

    formatIsoDate(iso) {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
    },

    formatTime(ts) {
      const d = new Date(Number(ts));
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    },

    async submitBid() {
      this.error = "";
      this.bid_success = "";

      const amountNum = Number(this.bid_amount);

      if (!amountNum || amountNum <= 0) {
        this.error = "Bid amount must be a positive number";
        return;
      }

      try {
        await api.placeBid(this.itemId, amountNum);
        this.bid_success = "Bid placed!";
        this.bid_amount = "";

        // reload item so current_bid updates
        await this.loadItem();
        await this.loadBids();
      } catch (e) {
        this.error = e.message || "Could not place bid";
      }
    },

    async loadBids() {
      this.bids_loading = true;
      this.bids_error = "";

      try {
        const data = await api.getBidHistory(this.itemId);
        this.bids = data;
      } catch (e) {
        this.bids_error = e.message || "Could not load bids";
        this.bids = [];
      } finally {
        this.bids_loading = false;
      }
    },

    async loadQuestions() {
      this.qError = "";
      try {
        const data = await api.getQuestionsForItem(this.itemId);

        this.questions = Array.isArray(data) ? data : (data.questions || []);
      } catch (e) {
        this.qError = e.message;
        this.questions = [];
      }
    },

    async submitQuestion() {
      this.qError = "";
      try {
        if (!this.newQuestion.trim()) return;
        await api.askQuestion(this.itemId, this.newQuestion.trim());
        this.newQuestion = "";
        await this.loadQuestions();
      } catch (e) {
        this.qError = e.message;
      }
    },

    async submitAnswer(questionId) {
      this.qError = "";
      try {
        const text = (this.answerDrafts[questionId] || "").trim();
        if (!text) return;

        await api.answerQuestion(questionId, text);
        this.answerDrafts[questionId] = "";
        await this.loadQuestions();
      } catch (e) {
        this.qError = e.message;
      }
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(amount);
    },
  },
};
</script>