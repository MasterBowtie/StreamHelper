class SubscriptionRepository {
    constructor(pool) {
        this.pool = pool;
    }

    // TODO:
    async getSubscribers() {}
    async addSubscriber() {}
    async updateSubscriber() {}

    async getSubscriberCount() {}
    
    // IDEA: Sort by Tier and Exclude Gifted
    async mostRecentSubscriber() {}
    
    // IDEA: Sort by Tiers
    async mostGenerousSubscriber() {}
}