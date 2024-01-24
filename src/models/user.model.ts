import { Document, type Model, type InferSchemaType } from "mongoose";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { compare, genSalt, hash } from "bcrypt";

import type { UserRoles } from "src/types";

@Schema({ timestamps: true, collection: "users" })
export class User {
   @Prop({ type: String, required: [true, "Please enter your name"] })
   name: string;

   @Prop({ type: String, required: [true, "Please enter an e-mail"], unique: true, index: true })
   email: string;

   @Prop({ type: String, required: [true, "Please enter a password"] })
   password: string;

   @Prop({ type: String, enum: ["user", "admin", "super-admin"], default: "user" })
   role: UserRoles;

   @Prop({ type: String, default: "" })
   resetPassword: string;

   comparePassword: (enteredPassword: string) => Promise<boolean>;
   getUser: (this: IUserDocument) => IUser;
}

export const USER_MODEL = User.name;
export const UserSchema = SchemaFactory.createForClass(User);

export type IUserSchemaType = InferSchemaType<typeof UserSchema> & { createdAt: Date | string };
export type IUser = Pick<IUserSchemaType, "name" | "email" | "role" | "createdAt"> & { id: string };
export type IUserDocument = IUserSchemaType & Document;
export type IUserModel = Model<IUserDocument>;

// hashing password
UserSchema.pre("save", async function (next) {
   if (!this.isModified("password")) next();
   const salt = await genSalt(10);
   this.password = await hash(this.password, salt);
});

// compare hashed password
UserSchema.methods.comparePassword = async function (this: IUserDocument, enteredPassword: string) {
   return await compare(enteredPassword, this.password);
};

UserSchema.methods.getUser = function (this: IUserDocument): IUser {
   const formattedDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(
      this.createdAt as Date
   );

   return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: formattedDate,
   };
};
