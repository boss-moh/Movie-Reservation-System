import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '@/app';
import {sampleTodosWithIds} from '@/contants';


// ─── GET /todos ───────────────────────────────────────────────────────────────

describe('GET /todos', () => {
  it('should return all todos', async () => {
    const res = await request(app).get('/todos');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.count).toBe(3);
  });

});

// ─── GET /todos/:id ───────────────────────────────────────────────────────────

describe('GET /todos/:id', () => {

  it('should return a todo by id', async () => {
    const todoItem = sampleTodosWithIds[0]!
    const res = await request(app).get(`/todos/${todoItem._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe(todoItem.title);
  });

  it('should return 404 if todo not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/todos/${fakeId}`);
    expect(res.statusCode).toBe(404)
  });

  it('should return 400 if id is invalid', async () => {
    const res = await request(app).get('/todos/invalid-id');
    expect(res.statusCode).toBe(400);
  });

});

// ─── POST /todos ──────────────────────────────────────────────────────────────

describe('POST /todos', () => {

  it('should create a todo successfully', async () => {
    const todoItem = { title: 'New Todo', description: 'Some description' };
    const res = await request(app).post('/todos').send(todoItem);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe(todoItem.title);
    expect(res.body.data.completed).toBe(false);
  });

  it('should return 400 if title is missing', async () => {
    const res = await request(app).post('/todos').send({ description: 'No title' });
    expect(res.statusCode).toBe(400);
  });

});

// ─── PUT /todos/:id ───────────────────────────────────────────────────────────

describe('PUT /todos/:id', () => {

  it('should update a todo successfully', async () => {
        const todoItem = sampleTodosWithIds[0]!
        const updatedTitle = 'Updated Title';

    const res = await request(app)
      .put(`/todos/${todoItem._id}`)
      .send({ title: updatedTitle });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe(updatedTitle);
  });

  it('should return 404 if todo not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/todos/${fakeId}`)
      .send({ title: 'Doesnt matter' });
    expect(res.statusCode).toBe(404);
  });

  it('should return 400 if id is invalid', async () => {
    const res = await request(app)
      .put('/todos/invalid-id')
      .send({ title: 'Doesnt matter' });
    expect(res.statusCode).toBe(400);
  });

});

// ─── DELETE /todos/:id ────────────────────────────────────────────────────────

describe('DELETE /todos/:id', () => {

  it('should delete a todo successfully', async () => {
        const todoItem = sampleTodosWithIds[0]!

    const res = await request(app).delete(`/todos/${todoItem._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(todoItem._id.toString());

    const todosRes = await request(app).get('/todos');
    expect(todosRes.statusCode).toBe(200);
    expect(todosRes.body.data).toHaveLength(2);
    expect(todosRes.body.count).toBe(2);
  });

  it('should return 404 if todo not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/todos/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });

  it('should return 400 if id is invalid', async () => {
    const res = await request(app).delete('/todos/invalid-id');
    expect(res.statusCode).toBe(400);
  });

});