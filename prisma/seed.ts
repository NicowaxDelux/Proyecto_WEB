import {PrismaClient} from "@prisma/client"

const prisma = new PrismaClient;

async function main() {
    await prisma.product.createMany({
        data: [
            { name: "Camiseta blanca", description: "Logo Superman", price: 45000, stock: 20 },
            { name: "Camisa negra", description: "Logo Batman", price: 40000, stock: 15}
        ],
    }); 
}

main()
.catch((e) => {console.error(e); process.exit(1); })
.finally(async () => {await prisma.$disconnect(); });