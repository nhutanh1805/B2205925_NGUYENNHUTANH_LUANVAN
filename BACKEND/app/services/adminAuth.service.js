const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

class AdminAuthService {
  constructor(client) {
    this.Admin = client.db().collection("admins");
  }

  extractAdminData(payload) {
    const admin = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: "admin",
      isActive: payload.isActive !== false,
    };

    Object.keys(admin).forEach(
      (key) => admin[key] === undefined && delete admin[key]
    );

    return admin;
  }

  async register(payload) {
    const admin = this.extractAdminData(payload);

    const exist = await this.Admin.findOne({ email: admin.email });
    if (exist) throw new Error("Email admin đã tồn tại");

    admin.password = await bcrypt.hash(admin.password, 10);
    admin.createdAt = new Date();
    admin.updatedAt = new Date();

    const result = await this.Admin.insertOne(admin);
    return { _id: result.insertedId, email: admin.email, name: admin.name };
  }

  async login(email, password) {
    const admin = await this.Admin.findOne({ email, isActive: true });
    if (!admin) throw new Error("Admin không tồn tại");

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error("Sai mật khẩu");

    return {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
  }

  async findAll() {
    return await this.Admin.find({ isActive: true })
      .project({ password: 0 })
      .toArray();
  }

  async delete(id) {
    const result = await this.Admin.findOneAndUpdate(
      { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
      { $set: { isActive: false, deletedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result.value;
  }
}

module.exports = AdminAuthService;
