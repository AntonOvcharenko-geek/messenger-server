const Message = require('../models/Message')
const Thread = require('../models/Thread')
const { generateMessage } = require('../service/message')
const ObjectID = require('mongodb').ObjectID

async function getMessages(req, res) {
  const threadId = req.params.id;
  try {
    const messages = await Message.find({ threadId: threadId }).populate('user').exec()

    res.status(200).send(messages);
  } catch (err) {
    res.status(400).send(err);
  }
}

async function createMessage(req, res) {
  const message = await generateMessage(req.body)

  if(message.type === 'error') return res.status(message.status).send(message.desc)

  try {
    const userExistInThread = await Thread.findOne({_id: req.body.threadId, users: req.body.user}).exec()
    if (!userExistInThread) {
      console.log(userExistInThread, "isUserExist");
      return res.sendStatus(400)
    }
  } catch (e) {
    return res.sendStatus(500)
  }

  try {
    const savedMessage = await message.result.save()
    res.send(savedMessage)
  } catch (e) {
    res.status(400).send(e)
  }
}

function deleteMessage(req, res) {
  Message.deleteOne({_id: ObjectID(req.params.id)}, (err, result) => {
    if(err) {
      console.log(err)
      return res.sendStatus(500).send(err.details[0].message)
    }
    res.sendStatus(200)
  })
}

module.exports.getMessages = getMessages;
module.exports.createMessage = createMessage;
module.exports.deleteMessage = deleteMessage;
