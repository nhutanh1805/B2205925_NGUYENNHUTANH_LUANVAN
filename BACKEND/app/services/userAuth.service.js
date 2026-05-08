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
      isDeactivated: false,
      isBanned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

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

    const result = await this.User.insertOne(user);

    return {
      _id: result.insertedId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      gender: user.gender,
      birthday: user.birthday,
    };
  }

  async login(email, password) {
    const user = await this.User.findOne({ email });
    if (!user) throw new Error("User không tồn tại");

    if (user.isDeactivated) throw new Error("Tài khoản đã bị vô hiệu hóa");
    if (user.isBanned) throw new Error("Tài khoản đã bị cấm");

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
  return await this.User.find({ isDeactivated: { $ne: true } })  
    .project({ password: 0 })
    .toArray();
}

  async updateProfile(id, payload) {
    if (!ObjectId.isValid(id)) return null;

    const updateData = {
      name: payload.name,
      phone: payload.phone,
      address: payload.address,
      gender: payload.gender,
      birthday: payload.birthday ? new Date(payload.birthday) : null,
      updatedAt: new Date(),
    };

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    if (Object.keys(updateData).length === 1) {
      throw new Error("Không có dữ liệu để cập nhật");
    }

    const result = await this.User.updateOne(
      { _id: new ObjectId(id), isActive: true },
      { $set: updateData }
    );

    if (result.matchedCount === 0) return null;

    return await this.User.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;

    const result = await this.User.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          isActive: false,
          deletedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result.value;
  }

  // Vô hiệu hóa vĩnh viễn (không thể kích hoạt lại)
  async deactivate(id) {
    if (!ObjectId.isValid(id)) return null;

    const user = await this.User.findOne({ _id: new ObjectId(id) });
    if (!user) return null;
    if (user.isDeactivated) throw new Error("Tài khoản đã bị vô hiệu hóa trước đó");

    const result = await this.User.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          isActive: false,
          isDeactivated: true,
          deactivatedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after", projection: { password: 0 } }
    );

    return result.value;
  }

  // Cấm tài khoản (có thể bỏ cấm)
  async ban(id) {
  if (!ObjectId.isValid(id)) return null;

  const user = await this.User.findOne({ _id: new ObjectId(id) });
  if (!user) return null;
  if (user.isDeactivated) throw new Error("Tài khoản đã bị vô hiệu hóa, không thể thao tác");
  if (user.isBanned) throw new Error("Tài khoản đã bị cấm trước đó");

  const result = await this.User.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        isActive: false,
        isBanned: true,
        bannedAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after", projection: { password: 0 } }
  );

  return result;  // ← bỏ .value
}

async deactivate(id) {
  if (!ObjectId.isValid(id)) return null;

  const user = await this.User.findOne({ _id: new ObjectId(id) });
  if (!user) return null;
  if (user.isDeactivated) throw new Error("Tài khoản đã bị vô hiệu hóa trước đó");

  const result = await this.User.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        isActive: false,
        isDeactivated: true,
        deactivatedAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after", projection: { password: 0 } }
  );

  return result;  // ← bỏ .value
}

async unban(id) {
  if (!ObjectId.isValid(id)) return null;

  const user = await this.User.findOne({ _id: new ObjectId(id) });
  if (!user) return null;
  if (user.isDeactivated) throw new Error("Tài khoản đã bị vô hiệu hóa, không thể thao tác");
  if (!user.isBanned) throw new Error("Tài khoản chưa bị cấm");

  const result = await this.User.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        isActive: true,
        isBanned: false,
        bannedAt: null,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after", projection: { password: 0 } }
  );

  return result;  // ← bỏ .value
}
}

module.exports = UserAuthService;