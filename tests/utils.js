import User from '../models/user';

export async function cleanUpDatabase() {
    await Promise.all([User.deleteMany().exec()]);
}