class FollowsRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async getFollowers() {}

    async findByTwitchId({twitchId}) {}

    async createFollow({twitchId, eventId}) {}

    async updateFollowState({twitchId, eventId, verify}) {}
}