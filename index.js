const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const talkers = require('./middlewares/speaker.js');
const validaEmail = require('./middlewares/validateEmail.js');
const validaPassword = require('./middlewares/validatePassword.js');
const validToken = require('./middlewares/token.js');
const validateToken = require('./middlewares/validateToken.js');
const validateName = require('./middlewares/validateName.js');
const validateAge = require('./middlewares/validateAge.js');
const validateTalk = require('./middlewares/validateTalk.js');
const validateWatchedAt = require('./middlewares/validateWatchedAt.js');
const validateRate = require('./middlewares/validateRate.js');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker/search', validateToken, async (request, response) => {
  const research = await talkers();
  const { q } = request.query;
  const search = research.filter((r) => r.name.includes(q));
  return response.status(200).json(search);
});

app.get('/talker', async (_request, response) => {
  const orator = await talkers();
  response.status(HTTP_OK_STATUS).send(orator);
});

app.get('/talker/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const speaker = await talkers();
    const talkerId = speaker.find((Id) => Id.id === +id);
    if (talkerId === undefined) {
  response.status(404).json({ message: 'Pessoa palestrante não encontrada' }); 
  } else {
    response.status(200).json(talkerId);
  }
  } catch (error) {
    response.status(500).json(error);
  }
});

app.post('/login', validaEmail, validaPassword, (request, response) => {
  const token = validToken();
  response.status(200).json({ token });
});

app.post('/talker',
validateToken,
validateName,
validateAge,
validateTalk,
validateWatchedAt,
validateRate, async (request, response) => {
  const speakerList = await talkers();
  const id = speakerList.length + 1;
  const { name, age, talk } = request.body;
  const { watchedAt, rate } = talk;
  console.log(name, age, talk);
  const newSpeaker = { id, name, age, talk: { watchedAt, rate } };
  speakerList.push(newSpeaker);
  await fs.writeFile('./talker.json', JSON.stringify(speakerList));
  return response.status(201).json(newSpeaker);
});

app.put('/talker/:id', 
validateToken,
validateName,
validateAge,
validateTalk,
validateWatchedAt,
validateRate, async (request, response) => {
  const speakerList = await talkers();
  const { id } = request.params;
  const { name, age, talk } = request.body;
  const talkerIndex = speakerList.findIndex((r) => r.id === Number(id));
  speakerList[talkerIndex] = { ...speakerList[talkerIndex], name, age, talk };
  await fs.writeFile('./talker.json', JSON.stringify(speakerList));
  return response.status(200).json(speakerList[talkerIndex]);
});

app.delete('/talker/:id', 
validateToken,
  async (request, response) => {
  const speakerList = await talkers();
  const { id } = request.params;
  const talkerIndex = speakerList.filter((r) => r.id !== +id);
  await fs.writeFile('./talker.json', JSON.stringify(talkerIndex));
  return response.status(204).end();
});

app.listen(PORT, () => {
  console.log('Online');
}); 
