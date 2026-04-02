import { IUser, User, UserRole } from "@/models";
import { appError, NotFoundError } from "@/util/errors";
import { loger } from "@/util/logger";

export class UserService {
  async getAllUsers(): Promise<{ users: IUser[]; total: number }> {
    try {
      const users = await User.find()
        .select(
          "-password -refreshToken -emailVerification -emailVerificationExpires",
        )
        .sort({ createdAt: -1 });

      const total = await User.countDocuments();
      return { users, total };
    } catch (error) {
      loger.warn("Failed to fetch users", error);
      throw new appError("Failed to fetch users");
    }
  }

  // update user role
  async updateUserRole(role: UserRole, userId: string): Promise<IUser> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true },
      ).select(
        "-password -refreshToken -emailVerification -emailVerificationExpires",
      );

      if (!user) {
        throw new NotFoundError("User not found");
      }
      return user;
    } catch (error) {
      loger.warn("Failed to update user", error);
      throw new appError("Failed to update user");
    }
  }

  //  delete User
  async deleteUser(userId: string): Promise<void> {
    try {
      await User.findByIdAndDelete(userId);
    } catch (error) {
      loger.warn("Failed to delete user", error);
      throw new appError("Failed to delete user");
    }
  }

  // add credits
  async addCredits(userId: string, credits: number): Promise<IUser> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { credits },
        { new: true },
      ).select(
        "-password -refreshToken -emailVerification -emailVerificationExpires",
      );

      if (!user) {
        throw new NotFoundError("User not found");
      }
      return user;
    } catch (error) {
      loger.warn("Failed to add user credits", error);
      throw new appError("Failed to add user credits");
    }
  }
}

export const userService = new UserService();
