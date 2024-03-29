import { Ai } from '@cloudflare/ai';
import { Hono } from 'hono';
import HTML from './index.html';
const app = new Hono();

app.post('/notes', async (c) => {
  const ai = new Ai(c.env.AI);

  const { text } = await c.req.json();
  if (!text) {
    return c.text('Missing text', 400);
  }

  const { results } = await c.env.DB.prepare(
    'INSERT INTO notes (text) VALUES (?) RETURNING *'
  )
    .bind(text)
    .run();

  const record = results.length ? results[0] : null;

  if (!record) {
    return c.text('Failed to create note', 500);
  }

  const { data } = await ai.run('@cf/baai/bge-base-en-v1.5', { text: [text] });
  const values = data[0];

  if (!values) {
    return c.text('Failed to generate vector embedding', 500);
  }

  const { id } = record;
  const inserted = await c.env.VECTORIZE_INDEX.upsert([
    {
      id: id.toString(),
      values,
    },
  ]);

  return c.json({ id, text, inserted });
});

app.get('/', async (c) => {
  const ai = new Ai(c.env.AI);

  if (!c.req.query('text')) {
    return c.text('Missing text', 400);
  }
  const question = c.req.query('text');

  const embeddings = await ai.run('@cf/baai/bge-base-en-v1.5', {
    text: question,
  });
  const vectors = embeddings.data[0];

  const SIMILARITY_CUTOFF = 0.85;
  const vectorQuery = await c.env.VECTORIZE_INDEX.query(vectors, { topK: 20 });
  const vecIds = vectorQuery.matches
    .filter((vec) => {
      console.log(vec.score, vec.id);
      return vec.score > SIMILARITY_CUTOFF;
    })
    .map((vec) => vec.id);

  let notes = [];
  if (vecIds.length) {
    const query = `SELECT * FROM notes WHERE id IN (${vecIds.join(', ')})`;
    const { results } = await c.env.DB.prepare(query).bind().all();
    if (results) notes = results.map((vec) => vec.text);
  }

  const contextMessage = notes.length
    ? `Context:\n${notes.map((note) => `- ${note}`).join('\n')}`
    : '';
  console.log(contextMessage);

  const systemPrompt = `When answering the question or responding, use the context provided, if it is provided and relevant.`;

  const stream = await ai.run('@cf/mistral/mistral-7b-instruct-v0.1', {
    messages: [
      ...(notes.length ? [{ role: 'system', content: contextMessage }] : []),
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ],
    stream: true,
  });

  return new Response(stream, {
    headers: { 'content-type': 'text/event-stream' },
  });
});

app.get('/home', (c) => {
  return c.html(HTML);
});

app.onError((err, c) => {
  console.log(err);
  return c.text(err);
});

export default app;
