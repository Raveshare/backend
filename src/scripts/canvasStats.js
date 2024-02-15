const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function getCanvasesCreatedEachDayForLast30DaysAndSaveToCSV() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const canvases = await prisma.canvases.findMany({
        where: {
            createdAt: {
                gte: thirtyDaysAgo,
            },
        },
        select: {
            createdAt: true,
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    // Grouping by date with count
    const groupedByDate = canvases.reduce((acc, { createdAt }) => {
        const date = createdAt.toISOString().split('T')[0]; // Extracting date part only
        if (!acc[date]) {
            acc[date] = 1;
        } else {
            acc[date]++;
        }
        return acc;
    }, {});

    // Preparing CSV content
    let csvContent = "Date,Canvas Created\n"; // Header
    for (const [date, count] of Object.entries(groupedByDate)) {
        csvContent += `${date},${count}\n`;
    }

    // Define file path
    const filePath = path.join(__dirname, 'canvases_created_last_30_days.csv');

    // Writing to CSV file
    fs.writeFile(filePath, csvContent, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to CSV file', err);
            return;
        }
        console.log('Saved canvas creation data to', filePath);
    });
}

getCanvasesCreatedEachDayForLast30DaysAndSaveToCSV()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
