const request = require('supertest');
const { app, server} = require('../server'); // Importing Express app defined in server.js

const { getArrayOfExistingfiles } = require('../utils/crudUtil');
const { getTotalWordCount } = require('../utils/wordCountUtil');
const { deleteFileByFilename } = require('../utils/crudUtil')
const { getMostFreqWords, getLeastFreqWords } = require('../utils/wordFrequencyUtil')

// Mock functions
jest.mock('../utils/crudUtil', () => ({
    getArrayOfExistingfiles: jest.fn(),
    deleteFileByFilename: jest.fn(),
    isNumeric: jest.fn().mockImplementation(value => !isNaN(value))
}));
jest.mock('../utils/wordCountUtil', () => ({
    getTotalWordCount: jest.fn()
}));

jest.mock('../utils/wordFrequencyUtil', () => ({
    getMostFreqWords: jest.fn(),
    getLeastFreqWords: jest.fn(),
    redisClient: {
        connect: jest.fn(),
        on: jest.fn()
    }
}));


describe('GET /ls', () => {
    afterEach(() => {
        server.close()
    })
  it('should return array of filenames', async () => {
    const mockFiles = [
      { filename: 'file1.txt' },
      { filename: 'file2.txt' },
      { filename: 'file3.txt' }
    ];
    getArrayOfExistingfiles.mockResolvedValue(mockFiles);

    const response = await request(app).get('/ls');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockFiles.map(file => file.filename));
  });

  it('should handle internal errors', async () => {
    getArrayOfExistingfiles.mockRejectedValue(new Error('Mocked internal error'));

    const response = await request(app).get('/ls');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Internal Error');
  });
});

describe('GET /wc', () => {
    afterEach(() => {
        server.close()
    })
    it('should return total word count', async () => {
      const mockTotal = 100;
      getTotalWordCount.mockResolvedValue(mockTotal);

      const response = await request(app).get('/wc');
  
      expect(response.status).toBe(200);
  
      expect(response.text).toBe(`${mockTotal}`);
    });
  
    it('should handle internal errors', async () => {
      getTotalWordCount.mockRejectedValue(new Error('Mocked internal error'));

      const response = await request(app).get('/wc');
  
      expect(response.status).toBe(500);
      expect(response.text).toBe('Internal Error');
    });
  });

describe('DELETE /rm', () => {
    afterEach(() => {
        server.close()
    })
    it('should delete file successfully', async () => {
      const mockFilename = 'mockFile.txt';
      deleteFileByFilename.mockResolvedValue(1);
      const response = await request(app)
        .delete('/rm')
        .send({ name: mockFilename });
      expect(response.status).toBe(200);
      expect(response.text).toBe(`File ${mockFilename} successfully removed from store.`);
    });
  
    it('should handle non-existing file', async () => {
      const mockFilename = 'nonExistingFile.txt';
      deleteFileByFilename.mockResolvedValue(0);
      const response = await request(app)
        .delete('/rm')
        .send({ name: mockFilename });
      expect(response.status).toBe(404);
      expect(response.text).toBe(`File ${mockFilename} does not exist in the file store.`);
    });
  
    it('should handle internal errors', async () => {
      const response = await request(app)
        .delete('/rm')
        .send({}) // passing null name
      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid request: "name" is required');
    });
});

describe('GET /freq-words', () => {
    afterEach(() => {
        server.close()
    })
    it('should return most frequent words in descending order', async () => {
      const limit = 10;
      const order = 'dsc';
  
      const mockFreqWords = ['word1', 'word2', 'word3'];
      getMostFreqWords.mockResolvedValue(mockFreqWords);
  
      const response = await request(app)
        .get('/freq-words')
        .query({ limit, order });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFreqWords);
    });
  
    it('should return least frequent words in ascending order', async () => {
      const limit = 10;
      const order = 'asc';
  
      const mockFreqWords = ['word1', 'word2', 'word3'];
      getLeastFreqWords.mockResolvedValue(mockFreqWords);
  
      const response = await request(app)
        .get('/freq-words')
        .query({ limit, order });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFreqWords);
    });
  
    it('should handle invalid limit type', async () => {
      const limit = 'abc';
      const order = 'dsc';
  
      const response = await request(app)
        .get('/freq-words')
        .query({ limit, order });
  
      expect(response.status).toBe(500);
      expect(response.text).toBe('Invalid limit type, must be an Integer');
    });
  
    it('should handle invalid order type', async () => {
      const limit = 10;
      const order = 'invalid';
  
      const response = await request(app)
        .get('/freq-words')
        .query({ limit, order });
  
      expect(response.status).toBe(500);
      expect(response.text).toBe('Invalid order type');
    });
  
    it('should handle internal errors', async () => {
      getMostFreqWords.mockRejectedValue(new Error('Mocked internal error'));
  
      const response = await request(app)
        .get('/freq-words')
        .query({ limit: 10, order: 'dsc' });
  
      expect(response.status).toBe(500);
      expect(response.text).toBe('Internal Error');
    });
});