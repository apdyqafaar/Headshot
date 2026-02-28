import mongoose from "mongoose"
import { connectDatabase } from "@/database/connection"
import { CreditsPackage } from "@/models/creditsPackage-model"
import { loger } from "@/util/logger"

const makeStripeId = () => `seed_${Math.random().toString(36).slice(2,9)}`
const packages = [
  {
    name: "Starter",
    credits: 20,
    price: 9.99,
    description: "Perfect for individuals getting started",
    bonus: 0,
    popular: false,
    stripePriceId: makeStripeId(),
    isActive: true,
  },
  {
    name: "Popular",
    credits: 75,
    price: 24.99,
    description: "Most chosen plan for growing users",
    bonus: 10,
    popular: true,
    stripePriceId: makeStripeId(),
    isActive: true,
  },
  {
    name: "Business",
    credits: 300,
    price: 79.99,
    description: "Great for teams and small businesses",
    bonus: 50,
    popular: false,
    stripePriceId: makeStripeId(),
    isActive: true,
  },
  {
    name: "Enterprise",
    credits: 1000,
    price: 199.99,
    description: "Advanced solution for large organizations",
    bonus: 250,
    popular: false,
    stripePriceId: makeStripeId(),
    isActive: true,
  },
]

async function seed() {
	try {
		await connectDatabase()

		for (const pkg of packages) {
			const saved = await CreditsPackage.findOneAndUpdate(
				{ name: pkg.name },
				{ $set: pkg },
				{ upsert: true, new: true, setDefaultsOnInsert: true },
			)
			loger.info(`Seeded credit package: ${saved?.name}`)
		}

		loger.info("Seeding complete")
	} catch (error) {
		loger.error("Error seeding credit packages", error)
		process.exitCode = 1
	} finally {
		await mongoose.disconnect()
	}
}

seed()

