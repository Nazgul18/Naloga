const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/podatki', (req, res) => {
  const filePath = path.join(__dirname, 'podatki.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.log('Napaka pri branju datoteke:', err);
      return res.status(500).json({ message: 'Prišlo je do napake.' });
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/podatki', (req, res) => {
  const noviPodatki = req.body;
  const filePath = path.join(__dirname, 'podatki.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    let podatki = [];

    if (err) {
      console.log('Napaka pri branju datoteke:', err);
      return res.status(500).json({ message: 'Prišlo je do napake.' });
    }

    if (data) {
      try {
        podatki = JSON.parse(data);
      } catch (e) {
        console.error('Napaka pri razčlenjevanju JSON:', e);
        return res.status(500).json({ message: 'Napaka pri obdelavi podatkov.' });
      }
    }

    const maxId = podatki.reduce((max, item) => item.id > max ? item.id : max, 0);
    const noviElement = {
      id: maxId + 1,
      ...noviPodatki,
      files: []
    };

    podatki.unshift(noviElement);

    fs.writeFile(filePath, JSON.stringify(podatki, null, 2), (err) => {
      if (err) {
        console.log('Napaka pri pisanju:', err);
        return res.status(500).json({ message: 'Napaka pri shranjevanju' });
      }
      res.status(201).json({ message: 'Podatki uspešno shranjeni!', id: noviElement.id });
    });
  });
});

app.post('/api/files', (req, res) => {
  const { name, size, modified, bucketId } = req.body;
  const filePath = path.join(__dirname, 'podatki.json');

  if (!bucketId || !name || !size || !modified) {
    return res.status(400).json({ message: 'Manjkajoči podatki.' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.log('Napaka pri branju datoteke:', err);
      return res.status(500).json({ message: 'Prišlo je do napake.' });
    }

    let buckets = JSON.parse(data);
    const bucket = buckets.find(b => b.id === bucketId);

    if (!bucket) {
      return res.status(404).json({ message: 'Bucket ne obstaja.' });
    }

    bucket.files.push({ name, size, modified });

    fs.writeFile(filePath, JSON.stringify(buckets, null, 2), (err) => {
      if (err) {
        console.log('Napaka pri pisanju:', err);
        return res.status(500).json({ message: 'Napaka pri pisanju.' });
      }
      res.status(201).json({ message: 'Datoteka uspešno dodana.' });
    });
  });
});

app.post('/api/deleteBucket', (req, res) => {
  const bucketId = req.body.bucketId;
  const filePath = path.join(__dirname, 'podatki.json');

  if (!bucketId) {
    return res.status(400).json({ message: 'Manjkajoči podatki.' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.log('Napaka pri branju datoteke:', err);
      return res.status(500).json({ message: 'Prišlo je do napake.' });
    }

    let buckets = JSON.parse(data);

    buckets = buckets.filter(item => item.id !== bucketId);

    fs.writeFile(filePath, JSON.stringify(buckets, null, 2), (err) => {
      if (err) {
        console.log('Napaka pri pisanju:', err);
        return res.status(500).json({ message: 'Napaka pri pisanju.' });
      }
      res.status(201).json({ message: 'Datoteka uspešno odstranjena.' });
    });
  });
});

app.post('/api/deleteFile', (req, res) => {
  const { bucketId, selectedFile } = req.body;
  const filePath = path.join(__dirname, 'podatki.json');

  if (!bucketId || !selectedFile || !selectedFile.name) {
    return res.status(400).json({ message: 'Manjkajo podatki.' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.log('Napaka pri branju datoteke:', err);
      return res.status(500).json({ message: 'Prišlo je do napake.' });
    }

    let buckets = JSON.parse(data);

    const bucketIndex = buckets.findIndex(b => b.id === bucketId);
    if (bucketIndex === -1) {
      return res.status(404).json({ message: 'Bucket ne obstaja' });
    }

    buckets[bucketIndex].files = buckets[bucketIndex].files.filter(file => file.name !== selectedFile.name);

    fs.writeFile(filePath, JSON.stringify(buckets, null, 2), (err) => {
      if (err) {
        console.log('Napaka pri pisanju:', err);
        return res.status(500).json({ message: 'Napaka pri pisanju.' });
      }
      res.status(201).json({ message: 'Datoteka uspešno odstranjena.' });
    });
  });
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
