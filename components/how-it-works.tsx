import { DollarSign, Package, Truck } from "lucide-react"
import { motion } from "framer-motion"

export default function HowItWorks() {
  const iconVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.1,
      rotate: [0, -10, 10, -10, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 2,
          ease: "linear"
        }
      }
    }
  }

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      viewport={{ once: true }}
    >
      <motion.div 
        className="flex flex-col items-center text-center"
        variants={itemVariants}
      >
        <motion.div 
          className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mb-4 cursor-pointer"
          variants={iconVariants}
          initial="initial"
          whileHover="hover"
        >
          <Package className="h-8 w-8 text-blue-500" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">1. List Your Extra Food</h3>
        <p className="text-gray-400 text-sm">
          Restaurants, event organizers, or individuals can list their surplus food with details and a minimum price.
        </p>
      </motion.div>

      <motion.div 
        className="flex flex-col items-center text-center"
        variants={itemVariants}
      >
        <motion.div 
          className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mb-4 cursor-pointer"
          variants={iconVariants}
          initial="initial"
          whileHover="hover"
        >
          <DollarSign className="h-8 w-8 text-blue-500" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">2. Bidding Process</h3>
        <p className="text-gray-400 text-sm">
          Interested parties place bids on available food listings. The minimum bid starts at the listed price.
        </p>
      </motion.div>

      <motion.div 
        className="flex flex-col items-center text-center"
        variants={itemVariants}
      >
        <motion.div 
          className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mb-4 cursor-pointer"
          variants={iconVariants}
          initial="initial"
          whileHover="hover"
        >
          <Truck className="h-8 w-8 text-blue-500" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">3. Collection & Donation</h3>
        <p className="text-gray-400 text-sm">
          Winners collect the food and distribute it to those in need, ensuring nothing goes to waste.
        </p>
      </motion.div>
    </motion.div>
  )
}

