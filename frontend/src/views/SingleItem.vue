<template>
  <div>
    <h1>Item {{ itemId }}</h1>

    <p v-if="loading">Loading...</p>
    <p v-if="error" style="color:red">{{ error }}</p>

    <div v-if="item && !loading">
      <p><strong>Name:</strong> {{ item.name }}</p>
      <p><strong>Description:</strong> {{ item.description }}</p>
      <p><strong>Current Bid:</strong> {{ item.current_bid }}</p>
    </div>
  </div>

  <hr />

  <h2>Place a bid</h2>

  <form @submit.prevent="submitBid">
    <input
      type="number"
      min="1"
      step="1"
      v-model="bid_amount"
      placeholder="Enter bid amount"
    />
    <button type="submit">Bid</button>
  </form>

  <p v-if="bid_success" style="color: green;">{{ bid_success }}</p>

  <hr />

  <h2>Bid history</h2>

  <p v-if="bids_loading">Loading bids...</p>
  <p v-if="bids_error" style="color:red">{{ bids_error }}</p>

  <ul v-if="!bids_loading && !bids_error">
    <li v-for="b in bids" :key="`${b.user_id}-${b.amount}-${b.timestamp || ''}`">
      <span>
        {{ b.first_name }} {{ b.last_name }}:
        <strong>{{ b.amount }}</strong>
      </span>
      <span v-if="b.timestamp"> ({{ formatTime(b.timestamp) }})</span>
    </li>

    <li v-if="bids.length === 0">No bids yet.</li>
</ul>

    <h2>Questions</h2>

    <p v-if="qError" style="color:red">{{ qError }}</p>

    <div v-if="isLoggedIn" style="margin-bottom: 12px;">
      <input v-model="newQuestion" placeholder="Ask a question..." />
      <button @click="submitQuestion">Ask</button>
    </div>
    <div v-else>
      <small>You must be logged in to ask/answer questions.</small>
    </div>

    <ul>
      <li v-for="q in questions" :key="q.question_id" style="margin-bottom: 12px;">
        <div>
          <strong>{{ q.question_text || q.question }}</strong>
          <div v-if="q.answer_text || q.answer" style="margin-top: 6px;">
            Answer: {{ q.answer_text || q.answer }}
          </div>
        </div>

        <div v-if="isLoggedIn && !(q.answer_text || q.answer)" style="margin-top: 6px;">
          <input v-model="answerDrafts[q.question_id]" placeholder="Write an answer..." />
          <button @click="submitAnswer(q.question_id)">Answer</button>
        </div>
      </li>
    </ul>

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

        // backend might return { questions: [...] } or just [...]
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
  },
};
</script>