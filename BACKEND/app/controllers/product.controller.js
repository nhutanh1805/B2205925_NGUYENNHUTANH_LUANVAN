exports.create = (req, res) => {
    res.send({ message: "create product handler" });
};

exports.findAll = (req, res) => {
    res.send({ message: "findAll products handler" });
};

exports.findOne = (req, res) => {
    res.send({ message: "findOne product handler" });
};

exports.update = (req, res) => {
    res.send({ message: "update product handler" });
};

exports.delete = (req, res) => {
    res.send({ message: "delete product handler" });
};

exports.deleteAll = (req, res) => {
    res.send({ message: "deleteAll products handler" });
};

exports.findByCategory = (req, res) => {
    res.send({ message: "findByCategory handler" });
};
