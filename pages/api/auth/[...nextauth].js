import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import {MongoDBAdapter} from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb"
import User from "../../../models/User";
import {initMongoose} from "../../../lib/mongoose";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        await initMongoose();
        const user = await User.findOne({email: credentials.email}).select('+password');
        
        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    session: async ({token,session}) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);