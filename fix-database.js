require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;

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

async function fixDatabase() {
    try {
        await mongoose.connect(mongoURI);
        console.log("✅ מחובר למסד הנתונים\n");

        // מחיקת כיתה א
        console.log("🗑️  מוחק את כיתה א...");
        await Class.deleteMany({ name: 'כיתה א' });
        console.log("✅ כיתה א נמחקה\n");

        // יצירת כיתה ח3
        console.log("➕ יוצר כיתה ח3...");
        const newClass = new Class({
            name: 'ח3',
            description: 'כיתה ח3'
        });
        await newClass.save();
        console.log(`✅ כיתה ח3 נוצרה (ID: ${newClass._id})\n`);

        // עדכון כל התלמידים
        console.log("👨‍🎓 משייך את כל התלמידים לכיתה ח3...");
        const studentsResult = await Student.updateMany(
            {},
            { classId: newClass._id }
        );
        console.log(`✅ ${studentsResult.modifiedCount} תלמידים שויכו לכיתה ח3\n`);

        // עדכון כל המורים
        console.log("👨‍🏫 משייך את כל המורים לכיתה ח3...");
        const teachersResult = await Teacher.updateMany(
            {},
            { classId: newClass._id }
        );
        console.log(`✅ ${teachersResult.modifiedCount} מורים שויכו לכיתה ח3\n`);

        // עדכון כל המוצרים
        console.log("🛒 משייך את כל המוצרים לכיתה ח3...");
        const productsResult = await Product.updateMany(
            {},
            { classId: newClass._id }
        );
        console.log(`✅ ${productsResult.modifiedCount} מוצרים שויכו לכיתה ח3\n`);

        // עדכון כל הקניות
        console.log("💳 משייך את כל הקניות לכיתה ח3...");
        const purchasesResult = await Purchase.updateMany(
            {},
            { classId: newClass._id }
        );
        console.log(`✅ ${purchasesResult.modifiedCount} קניות שויכו לכיתה ח3\n`);

        console.log("🎉 הכל הושלם בהצלחה!");

    } catch (error) {
        console.error("❌ שגיאה:", error.message);
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 החיבור למסד הנתונים נסגר.");
    }
}

fixDatabase();
