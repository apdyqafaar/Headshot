import argon2 from "argon2";

export class PasswordService{

    private readonly saltRounds=12

    // hash password
    async hashPassword(password:string):Promise<string>{
        const result = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16, // 64 MB
            timeCost: 3,
            parallelism: 1,
          });

          return result
    }


    // verifying password
    async varifyPassword(data:{password:string, hash:string}):Promise<boolean>{
        const {hash, password}=data
        const result=await argon2.verify(hash, password)
        return result
    }
}

export const passwordService=new PasswordService()