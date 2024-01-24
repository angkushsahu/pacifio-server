import { createHash, randomBytes } from "crypto";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { ForgotPasswordDTO, LoginDTO, ResetPasswordDTO, SignupDTO } from "./auth.dto";
import { type IUserModel, USER_MODEL } from "src/models";
import { sendResetMail } from "src/mailService";
import { ErrorHandler } from "src/exceptions";
import type { IStatusCode } from "src/types";

@Injectable()
export default class AuthService {
   constructor(
      @InjectModel(USER_MODEL) private readonly userModel: IUserModel,
      private readonly jwtService: JwtService
   ) {}

   async getJwtToken({ id }: { id: string }) {
      return await this.jwtService.signAsync(
         { id },
         { secret: process.env.JWT_SECRET, expiresIn: Number(process.env.COOKIE_AGE) }
      );
   }

   async signup({ body, statusCode }: { body: SignupDTO } & IStatusCode) {
      try {
         const { email, name, password } = body;
         const userExists = await this.userModel.findOne({ email });
         if (userExists) throw new ErrorHandler({ message: "E-mail already exists, login instead", statusCode: 409 });

         const user = await this.userModel.create({ name, email, password });
         const token = await this.getJwtToken({ id: user.id });
         return { success: true, message: "User registered successfully", statusCode, data: { user: user.getUser(), token } };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async login({ body, statusCode }: { body: LoginDTO } & IStatusCode) {
      try {
         const { email, password } = body;
         const user = await this.userModel.findOne({ email });
         if (!user) throw new ErrorHandler({ message: "User not registered, signup instead", statusCode: 404 });

         const arePasswordsMatching = await user.comparePassword(password);
         if (!arePasswordsMatching) throw new ErrorHandler({ message: "Invalid credentials", statusCode: 400 });

         const token = await this.getJwtToken({ id: user.id });

         return { success: true, message: "Login successful", statusCode, data: { user: user.getUser(), token } };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async forgotPassword({ body, statusCode }: { body: ForgotPasswordDTO } & IStatusCode) {
      try {
         const { email } = body;
         const user = await this.userModel.findOne({ email });
         if (!user) throw new ErrorHandler({ message: "This e-mail is not registered with us, signup instead", statusCode: 404 });

         const resetToken = randomBytes(16).toString("hex");
         user.resetPassword = createHash("sha256").update(resetToken).digest("hex");
         const mailResponse = await sendResetMail({ email, resetToken });
         if (!mailResponse.success) throw new ErrorHandler({ message: mailResponse.message, statusCode: 500 });

         await user.save();
         return { success: true, message: mailResponse.message, statusCode };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async resetPassword({ body, statusCode }: { body: ResetPasswordDTO } & IStatusCode) {
      try {
         const { password, resetId } = body;
         const resetPassword = createHash("sha256").update(resetId).digest("hex");
         const user = await this.userModel.findOne({ resetPassword });
         if (!user) throw new ErrorHandler({ message: "User not found", statusCode: 404 });

         user.password = password;
         user.resetPassword = "";
         await user.save();
         return { success: true, message: "Password updated successfully, login with new credentials", statusCode };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   // for passport auth guard -- **DO NOT** change the return type
   async getUserByIdForPassportValidation(id: string) {
      try {
         const user = await this.userModel.findById(id);
         if (!user) throw new ErrorHandler({ message: "User not found", statusCode: 404 });
         return user;
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }
}
