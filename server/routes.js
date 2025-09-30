// server/routes.js
import { readFile, unlink } from 'fs/promises';
import { BusinessRulesEngine } from './services/businessRules.js';
import { XMLParser } from './services/xmlParser.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

export function registerRoutes(app, storage) { // storage is now a parameter
  const xmlParser = new XMLParser();
  const businessRulesEngine = new BusinessRulesEngine(storage);

  app.post('/api/parcels/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    let xmlContent;
    try {
      xmlContent = await readFile(req.file.path, 'utf8');
      xmlContent = xmlContent.replace(/^\uFEFF/, '');
    } catch (error) {
      console.error('Error reading file:', error);
      return res.status(500).send('Error reading file.');
    }

    let parsedParcels;
    try {
      parsedParcels = await xmlParser.parseXML(xmlContent);
    } catch (error) {
      console.error('Error parsing XML:', error);
      return res.status(400).send('Invalid XML format.');
    }

    const processedParcels = [];
    for (const parsedParcel of parsedParcels) {
      try {
        const insertParcel = xmlParser.convertToInsertParcel(parsedParcel);
        const parcel = await businessRulesEngine.processParcel(insertParcel);
        processedParcels.push(parcel);
      } catch (error) {
        console.error('Error processing parcel:', error);
      }
    }

    try {
      await storage.createParcels(processedParcels);
      res.status(201).send({
        message: 'Parcels processed and stored successfully.',
        parcels: processedParcels,
      });
    } catch (error) {
      console.error('Error storing parcels:', error);
      res.status(500).send('Error storing parcels.');
    } finally {
      await unlink(req.file.path);
    }
  });

  app.get('/api/parcels', async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'receptionDate', order = 'desc' } = req.query;
    try {
      const parcels = await storage.getParcels({
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        order,
      });
      res.status(200).send(parcels);
    } catch (error) {
      console.error('Error fetching parcels:', error);
      res.status(500).send('Error fetching parcels.');
    }
  });

  app.get('/api/metrics', async (req, res) => {
    try {
      const metrics = await storage.getMetrics();
      res.status(200).send(metrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).send('Error fetching metrics.');
    }
  });

  app.get('/api/departments', async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.status(200).send(departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).send('Error fetching departments.');
    }
  });

  app.post('/api/departments', async (req, res) => {
    const { name, isCustom } = req.body;
    if (!name) {
      return res.status(400).send('Department name is required.');
    }
    try {
      const newDepartment = await storage.createDepartment({ name, isCustom });
      res.status(201).send(newDepartment);
    } catch (error) {
      console.error('Error creating department:', error);
      res.status(500).send('Error creating department.');
    }
  });

  app.get('/api/business-rules', async (req, res) => {
    try {
      const rules = await storage.getBusinessRules();
      res.status(200).send(rules);
    } catch (error) {
      console.error('Error fetching business rules:', error);
      res.status(500).send('Error fetching business rules.');
    }
  });

  app.put('/api/business-rules', async (req, res) => {
    try {
      const updatedRules = await storage.updateBusinessRules(req.body);
      res.status(200).send(updatedRules);
    } catch (error) {
      console.error('Error updating business rules:', error);
      res.status(500).send('Error updating business rules.');
    }
  });
}