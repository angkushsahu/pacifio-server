import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

import { ADDRESS_MODEL, type IAddressModel } from "src/models";
import type { IStatusCode, UserServiceArgs } from "src/types";
import { ErrorHandler } from "src/exceptions";
import { AddressDTO } from "./address.dto";

@Injectable()
export default class AddressService {
   constructor(@InjectModel(ADDRESS_MODEL) private readonly addressModel: IAddressModel) {}

   async createAddress({ statusCode, user, addressBody }: UserServiceArgs & IStatusCode & { addressBody: AddressDTO }) {
      try {
         const address = await this.addressModel.create({ ...addressBody, user: user.id });
         if (!address) throw new ErrorHandler({ message: "Unable to create address, try again", statusCode: 500 });

         return {
            success: true,
            message: "Address created successfully",
            statusCode,
            data: { address: address.getAddress(user.getUser()) },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async updateAddress({
      statusCode,
      user,
      addressBody,
      id,
   }: UserServiceArgs & IStatusCode & { addressBody: AddressDTO; id: string }) {
      try {
         const address = await this.addressModel.findOneAndUpdate({ _id: id, user: user._id }, addressBody, {
            new: true,
            runValidators: true,
         });
         if (!address) throw new ErrorHandler({ message: "Address not found", statusCode: 404 });

         return {
            success: true,
            message: "Address updated successfully",
            statusCode,
            data: { address: address.getAddress(user.getUser()) },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async deleteAddress({ statusCode, user, id }: UserServiceArgs & IStatusCode & { id: string }) {
      try {
         const address = await this.addressModel.findOneAndDelete({ _id: id, user: user._id });
         if (!address) throw new ErrorHandler({ message: "Address not found", statusCode: 404 });
         return { success: true, message: "Address deleted successfully", statusCode };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async getAllAddress({ statusCode, user }: UserServiceArgs & IStatusCode) {
      try {
         const address = await this.addressModel.find({ user: user._id });
         const totalAddresses = await this.addressModel.countDocuments({ user: user._id });
         if (!address) throw new ErrorHandler({ message: "Unable to find address, try again", statusCode: 500 });

         const addresses = address.map((address) => address.getAddress(user.getUser()));

         return {
            success: true,
            message: "Addresses found successfully",
            statusCode,
            data: { totalAddresses, addresses },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }

   async getAddress({ statusCode, user, id }: UserServiceArgs & IStatusCode & { id: string }) {
      try {
         const address = await this.addressModel.findById(id);
         if (!address || user.id !== address.user.toString())
            throw new ErrorHandler({ message: "Address not found", statusCode: 404 });

         return {
            success: true,
            message: "Address found successfully",
            statusCode,
            data: { address: address.getAddress(user.getUser()) },
         };
      } catch (error: any) {
         throw new ErrorHandler({ message: error.message as string, statusCode: error.statusCode || 500 });
      }
   }
}
