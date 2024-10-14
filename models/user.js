import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Define the schema for users
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: async function (email) {
                const user = await this.constructor.findOne({ email });
                return !user || this.id === user.id;
            },
            message: props => 'The specified email address is already in use.'
        },
    },
    profilePictureUrl: {
        type: String,
        default: 'default.jpg'
    },
    publications: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Publication'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.set("toJSON", {
    transform: transformJsonUser
});

function transformJsonUser(doc, json, options) {
    // Remove the hashed password from the generated JSON.
    delete json.password;
    return json;
}

// Create the model from the schema and export it
export default mongoose.model('User', userSchema, 'users');