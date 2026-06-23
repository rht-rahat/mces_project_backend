const modelHelper = {
  find: async (MongooseModel, collectionName, filter = {}, sort = null) => {
    let query = MongooseModel.find(filter);
    if (sort) {
      query = query.sort(sort);
    }
    return await query.exec();
  },

  findOne: async (MongooseModel, collectionName, filter = {}) => {
    return await MongooseModel.findOne(filter).exec();
  },

  findById: async (MongooseModel, collectionName, id) => {
    return await MongooseModel.findById(id).exec();
  },

  create: async (MongooseModel, collectionName, data) => {
    const newItem = new MongooseModel(data);
    return await newItem.save();
  },

  findByIdAndUpdate: async (MongooseModel, collectionName, id, updateData) => {
    return await MongooseModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  },

  findByIdAndDelete: async (MongooseModel, collectionName, id) => {
    return await MongooseModel.findByIdAndDelete(id).exec();
  }
};

module.exports = modelHelper;
