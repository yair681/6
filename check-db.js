require('dotenv').config();
const mongoose = require('mongoose');

// חיבור למסד הנתונים
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("MONGO_URI לא מוגדר!");
    process.exit(1);
}

// הגדרת מודלים
const classSchema = new mongoose.Schema({
    name: String,
    description: String,
    createdAt: Date
});

const studentSchema = new mongoose.Schema({
    password: String,
    name: String,
    balance: Number,
    classId: mongoose.Schema.Types.ObjectId
});

const teacherSchema = new mongoose.Schema({
    password: String,
    name: String,
    classId: mongoose.Schema.Types.ObjectId,
    createdAt: Date
});

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    image: String,
    classId: mongoose.Schema.Types.ObjectId,
    createdAt: Date
});

const purchaseSchema = new mongoose.Schema({
    studentId: mongoose.Schema.Types.ObjectId,
    studentName: String,
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    price: Number,
    classId: mongoose.Schema.Types.ObjectId,
    status: String,
    createdAt: Date,
    approvedAt: Date
});

const Class = mongoose.model('Class', classSchema);
const Student = mongoose.model('Student', studentSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Product = mongoose.model('Product', productSchema);
const Purchase = mongoose.model('Purchase', purchaseSchema);

async function checkDatabase() {
    try {
        await mongoose.connect(mongoURI);
        console.log("✅ מחובר בהצלחה ל-MongoDB!\n");

        // ספירת רשומות
        const classCount = await Class.countDocuments();
        const studentCount = await Student.countDocuments();
        const teacherCount = await Teacher.countDocuments();
        const productCount = await Product.countDocuments();
        const purchaseCount = await Purchase.countDocuments();

        console.log("📊 סטטיסטיקות מסד הנתונים:");
        console.log("================================");
        console.log(`🏫 כיתות: ${classCount}`);
        console.log(`👨‍🎓 תלמידים: ${studentCount}`);
        console.log(`👨‍🏫 מורים: ${teacherCount}`);
        console.log(`🛒 מוצרים: ${productCount}`);
        console.log(`💳 קניות: ${purchaseCount}`);
        console.log("================================\n");

        // הצגת כיתות
        if (classCount > 0) {
            console.log("📚 רשימת כיתות:");
            const classes = await Class.find({});
            classes.forEach(c => {
                console.log(`  - ${c.name} (ID: ${c._id})`);
            });
            console.log("");
        }

        // הצגת תלמידים
        if (studentCount > 0) {
            console.log("👨‍🎓 רשימת תלמידים:");
            const students = await Student.find({}).populate('classId');
            students.forEach(s => {
                const className = s.classId ? s.classId.name : 'לא משויך';
                console.log(`  - ${s.name} | יתרה: ${s.balance} | כיתה: ${className} | סיסמה: ${s.password}`);
            });
            console.log("");
        }

        // הצגת מורים
        if (teacherCount > 0) {
            console.log("👨‍🏫 רשימת מורים:");
            const teachers = await Teacher.find({}).populate('classId');
            teachers.forEach(t => {
                const className = t.classId ? t.classId.name : 'לא משויך';
                console.log(`  - ${t.name || 'ללא שם'} | כיתה: ${className} | סיסמה: ${t.password}`);
            });
            console.log("");
        }

        // הצגת מוצרים
        if (productCount > 0) {
            console.log("🛒 רשימת מוצרים:");
            const products = await Product.find({}).populate('classId');
            products.forEach(p => {
                const className = p.classId ? p.classId.name : 'לא משויך';
                console.log(`  - ${p.name} | מחיר: ${p.price} | כיתה: ${className}`);
            });
            console.log("");
        }

        // הצגת קניות אחרונות
        if (purchaseCount > 0) {
            console.log("💳 קניות אחרונות (10 אחרונות):");
            const purchases = await Purchase.find({}).sort({ createdAt: -1 }).limit(10);
            purchases.forEach(p => {
                const status = p.status === 'pending' ? '⏳ ממתין' : 
                              p.status === 'approved' ? '✅ אושר' : '❌ נדחה';
                console.log(`  - ${p.studentName} קנה ${p.productName} (${p.price} נקודות) - ${status}`);
            });
            console.log("");
        }

        if (classCount === 0 && studentCount === 0 && teacherCount === 0) {
            console.log("⚠️  מסד הנתונים ריק! הפעל את השרת כדי לאתחל אותו.");
        }

    } catch (error) {
        console.error("❌ שגיאה בחיבור למסד הנתונים:", error.message);
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 החיבור למסד הנתונים נסגר.");
    }
}

checkDatabase();
