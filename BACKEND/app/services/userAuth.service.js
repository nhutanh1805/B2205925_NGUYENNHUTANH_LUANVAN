const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

class UserAuthService {
  constructor(client) {
    this.User = client.db().collection("users");
  }

  extractUserData(payload) {
    const user = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phone: payload.phone || "",
      address: payload.address || "",
      gender: payload.gender || "",
      birthday: payload.birthday ? new Date(payload.birthday) : null,
      role: "user",
      isActive: payload.isActive !== false,
    };

    // Xóa các key undefined
    Object.keys(user).forEach(
      (key) => user[key] === undefined && delete user[key]
    );

    return user;
  }

  async register(payload) {
    const user = this.extractUserData(payload);

    const exist = await this.User.findOne({ email: user.email });
    if (exist) throw new Error("Email user đã tồn tại");

    user.password = await bcrypt.hash(user.password, 10);
    user.createdAt = new Date();
    user.updatedAt = new Date();

    const result = await this.User.insertOne(user);
    return {
      _id: result.insertedId,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      gender: user.gender,
      birthday: user.birthday,
    };
  }

  async login(email, password) {
    const user = await this.User.findOne({ email, isActive: true });
    if (!user) throw new Error("User không tồn tại");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Sai mật khẩu");

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      gender: user.gender,
      birthday: user.birthday,
      role: user.role,
    };
  }

  async findAll() {
    return await this.User.find({ isActive: true })
      .project({ password: 0 })
      .toArray();
  }

  async delete(id) {
    const result = await this.User.findOneAndUpdate(
      { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
      { $set: { isActive: false, deletedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result.value;
  }
}

module.exports = UserAuthService;
