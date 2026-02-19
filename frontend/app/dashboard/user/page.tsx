"use client"

import { useUser } from "@/lib/context"

const userPage = () => {
   const {user}=useUser()
  console.log(user)
  return (
    <div>adminPage ${user?.name}</div>
  )

}

export default userPage