const fs = require('fs');
const path = require('path');

const institutions = [
    { name: "Stanford University", code: "STAN", type: "University", city: "Stanford", state: "CA", country: "USA" },
    { name: "Harvard University", code: "HARV", type: "University", city: "Cambridge", state: "MA", country: "USA" },
    { name: "Massachusetts Institute of Technology", code: "MIT", type: "University", city: "Cambridge", state: "MA", country: "USA" },
    { name: "University of Oxford", code: "OXF", type: "University", city: "Oxford", state: "UK", country: "UK" },
    { name: "University of Cambridge", code: "CAM", type: "University", city: "Cambridge", state: "UK", country: "UK" },
    { name: "National University of Singapore", code: "NUS", type: "University", city: "Singapore", state: "SG", country: "Singapore" },
    { name: "University of Toronto", code: "UTOR", type: "University", city: "Toronto", state: "ON", country: "Canada" },
    { name: "University of Melbourne", code: "UMEL", type: "University", city: "Melbourne", state: "VIC", country: "Australia" },
    { name: "Tsinghua University", code: "TSING", type: "University", city: "Beijing", state: "BJ", country: "China" },
    { name: "ETH Zurich", code: "ETH", type: "University", city: "Zurich", state: "ZH", country: "Switzerland" }
];

const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Aarav", "Vihaan", "Aditya", "Sai", "Reyansh", "Ananya", "Diya", "Myra", "Sana", "Zoya"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Sharma", "Patel", "Kumar", "Singh", "Gupta", "Reddy", "Mishra", "Joshi", "Iyer", "Verma"];
const courses = ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Data Science", "Physics", "Chemistry", "Mathematics", "Economics", "Psychology"];
const degrees = ["B.Sc", "B.Tech", "B.A", "M.Sc", "M.Tech", "M.A", "Ph.D"];

const generateRandomStudent = (instCode, index) => {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const certNum = `${instCode}${20240000 + index}`; // e.g. STAN20240001
    const roll = `R${202000 + index}`;
    const degree = degrees[Math.floor(Math.random() * degrees.length)];
    const course = courses[Math.floor(Math.random() * courses.length)];
    const year = 2020 + Math.floor(Math.random() * 5); // 2020-2024
    const total = 100;
    const marks = 60 + Math.floor(Math.random() * 40); // 60-99
    const pct = marks.toFixed(1);

    // Format: Certificate Number, Student Name, Roll Number, Course Name, Year, Marks, Total, Percentage
    return `${certNum}, ${fn} ${ln}, ${roll}, ${degree} ${course}, ${year}, ${marks}, ${total}, ${pct}`;
};

// Generate Institutions CSV
const institutionsCsvContent = institutions.map(i =>
    `${i.name}, ${i.code}, ${i.type}, ${i.city}, ${i.state}, registrar@${i.code.toLowerCase()}.edu, 555-0100`
).join('\n');
fs.writeFileSync(path.join(__dirname, '..', 'bulk_institutions.csv'), institutionsCsvContent);
console.log('Created bulk_institutions.csv');

// Generate 3 Batch Files of 500 certificates each
for (let b = 1; b <= 3; b++) {
    let csvContent = "";
    for (let i = 0; i < 500; i++) {
        const inst = institutions[Math.floor(Math.random() * institutions.length)];
        csvContent += generateRandomStudent(inst.code, i + (b * 1000)) + '\n';
    }
    fs.writeFileSync(path.join(__dirname, '..', `bulk_dataset_batch_${b}.csv`), csvContent);
    console.log(`Created bulk_dataset_batch_${b}.csv with 500 records`);
}
