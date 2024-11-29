import User from '../models/user.js';
import Friend from '../models/friend.js';

export const seedFriends = async () => {
    const users = await User.find();

    return Promise.all(
        users.map(async (user) => {
            const friends = users.filter(
                (friend) => friend._id.toString() !== user._id.toString()
            );
            const friendIds = friends.map((friend) => friend._id);

            return Promise.all(
                friendIds.map(async (friendId) => {
                    try {
                        await Friend.addFriend(user._id, friendId);

                        const friend = await Friend.findOne({
                            users: [user._id, friendId],
                        });
                        friend.status = 'accepted';
                        await friend.save();
                    } catch (error) {
                        // Ignore duplicate friendships
                    }
                })
            );
        })
    );
};
