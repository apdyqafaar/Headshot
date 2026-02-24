import mongoose from "mongoose"
import { connectDatabase } from "@/database/connection"
import { CreditsPackage } from "@/models/creditsPackage-model"
import { loger } from "@/util/logger"

const makeStripeId = () => `seed_${Math.random().toString(36).slice(2,9)}`

const packages = [
	{ name: "Starter Pack", credits: 10, price: 4.99, description: "Good for trying the service", bonus: 0, popular: false, stripePriceId: makeStripeId(), isActive: true },
	{ name: "Bronze Pack", credits: 25, price: 9.99, description: "Small bundle", bonus: 1, popular: false, stripePriceId: makeStripeId(), isActive: true },
	{ name: "Silver Pack", credits: 50, price: 17.99, description: "Best value for casual users", bonus: 5, popular: true, stripePriceId: makeStripeId(), isActive: true },
	{ name: "Gold Pack", credits: 100, price: 29.99, description: "Popular choice", bonus: 15, popular: true, stripePriceId: makeStripeId(), isActive: true },
	{ name: "Platinum Pack", credits: 200, price: 49.99, description: "For power users", bonus: 40, popular: false, stripePriceId: makeStripeId(), isActive: true },
	{ name: "Starter Promo", credits: 15, price: 3.99, description: "Limited promo starter", bonus: 2, popular: false, stripePriceId: makeStripeId(), isActive: true },
	{ name: "Monthly Lite", credits: 60, price: 14.99, description: "Monthly subscription style pack", bonus: 0, popular: false, stripePriceId: makeStripeId(), isActive: true },
	{ name: "Biz Pack", credits: 500, price: 99.99, description: "Business bundle", bonus: 100, popular: false, stripePriceId: makeStripeId(), isActive: true },
	{ name: "Education Pack", credits: 75, price: 19.99, description: "Special pricing for students", bonus: 10, popular: false, stripePriceId: makeStripeId(), isActive: true },
	{ name: "Mega Pack", credits: 1000, price: 179.99, description: "Best bulk price", bonus: 300, popular: true, stripePriceId: makeStripeId(), isActive: true },
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

