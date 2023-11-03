const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// Function to parse a line of data and insert it into the database
async function insertData(line) {
  const data = line.split('\t'); // Assuming tab-separated data

  const assetData = {
    tags: data[1].slice(1, -1).split(','), // Remove curly braces and split into an array
    type: data[2],
    author: data[3],
    image: data[4],
    createdAt: new Date(data[5]),
    updatedAt: new Date(data[6]),
    dimensions: data[7].slice(1, -1).split(',').map(Number), // Remove curly braces and convert to an array of integers
    campaign: data[8],
    featured: data[9] === 't', // Assuming 't' represents true and 'f' represents false
    wallet: data[10],
  };

  try {
    await prisma.assets.create({
      data: assetData,
    });
    console.log('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting data:', error);
  }
}

// Function to read the file and insert data line by line
async function uploadDataFromFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const lines = data.split('\n');

    for (const line of lines) {
      if (line.trim() !== '') {
        await insertData(line);
      }
    }
  } catch (error) {
    console.error('Error reading file:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Replace 'your-data-file.txt' with the path to your data file
uploadDataFromFile('assets.txt');
