import mongoose from "mongoose";
import bcrypt  from "bcrypt"
const { Schema } = mongoose;

const userSchema = new Schema({
  userId: {
    type: String,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [4, "Password must be at least 4 characters long"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: String,
  profilePicture: {
    type:String,
    default:()=>{
     const chooseImg=["1.png","2.png","3.jpg","5.jpg","6.jpg","7.jpg","8.jpg","9.jpg"]
     const indexNo=`/images/${ chooseImg[Math.floor(Math.random()*8)]}`
     return indexNo
    }
  },
  address:String,
  phone:Number,
  DOB:String,
  bio:String,
  links:{
    twitter:String,
    linkedin:String,
    github:String,
    facebook:String,
    instagram:String
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  friends: [{
    _id:false,
    friendId: { type: Schema.Types.ObjectId, ref: 'User' },
    conversationId: { type: Schema.Types.ObjectId, ref: 'conversation' },
    blocked:{type:Boolean,default: false},// if true then u have been blocked by your friend
  }],
 
  
});


// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});


// Update updatedAt on save
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});




userSchema.pre("save", async function (next) {
    if (!this.userId) {
      // If userId is not provided, generate it from firstName and a four-digit random number
      const randomFourDigits = generateRandomFourDigits();
      const namepart=this.name.trim().split(" ");
      this.userId = `${namepart[0].toLowerCase()}${randomFourDigits}`;
      // Ensure userId is unique
      let userWithSameId = await this.constructor.findOne({ userId: this.userId });
      while (userWithSameId) {
        randomFourDigits = generateRandomFourDigits();
        this.userId = `${this.firstName}${randomFourDigits}`;
        userWithSameId = await this.constructor.findOne({ userId: this.userId });
      }
    }
    next();
  });


  const generateRandomFourDigits = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };


const User = mongoose.model('User', userSchema);

export default User;
