"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const http_1 = require("http");
const storage_1 = require("./storage");
const xmlParser_1 = require("./services/xmlParser");
const businessRules_1 = require("./services/businessRules");
const schema_1 = require("@shared/schema");
const zod_1 = require("zod");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    dest: 'uploads/',
    fileFilter: (_req, file, cb) => {
        // Accept both .xml files and text/xml MIME type
        if (file.originalname.toLowerCase().endsWith('.xml') ||
            file.mimetype === 'text/xml' ||
            file.mimetype === 'application/xml') {
            cb(null, true);
        }
        else {
            cb(new Error('Only XML files are allowed'));
        }
    }
});
async function registerRoutes(app) {
    // Get all parcels with optional filtering
    app.get("/api/parcels", async (req, res) => {
        try {
            const { department, status, search } = req.query;
            let parcels = await storage_1.storage.getAllParcels();
            if (department && typeof department === 'string') {
                parcels = parcels.filter(p => p.department === department);
            }
            if (status && typeof status === 'string') {
                parcels = parcels.filter(p => p.status === status);
            }
            if (search && typeof search === 'string') {
                const searchLower = search.toLowerCase();
                parcels = parcels.filter(p => p.parcelId.toLowerCase().includes(searchLower) ||
                    p.department.toLowerCase().includes(searchLower));
            }
            res.json(parcels);
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    // Get single parcel
    app.get("/api/parcels/:id", async (req, res) => {
        try {
            const parcel = await storage_1.storage.getParcel(req.params.id);
            if (!parcel) {
                return res.status(404).json({ message: "Parcel not found" });
            }
            res.json(parcel);
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    // Create new parcel
    app.post("/api/parcels", async (req, res) => {
        try {
            const validatedData = schema_1.insertParcelSchema.parse(req.body);
            const parcel = await storage_1.storage.createParcel(validatedData);
            res.status(201).json(parcel);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid parcel data", errors: error.errors });
            }
            res.status(500).json({
                message: error instanceof Error ? error.message : "An unexpected error occurred"
            });
        }
    });
    // Update parcel
    app.patch("/api/parcels/:id", async (req, res) => {
        try {
            const parcel = await storage_1.storage.updateParcel(req.params.id, req.body);
            if (!parcel) {
                return res.status(404).json({ message: "Parcel not found" });
            }
            res.json(parcel);
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    // Upload and process XML file
    app.post("/api/parcels/upload-xml", upload.single('xmlFile'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No XML file provided" });
            }
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            let xmlContent;
            try {
                xmlContent = await fs.readFile(req.file.path, 'utf8');
                // Remove BOM if present
                xmlContent = xmlContent.replace(/^\uFEFF/, '');
                // Log the entire XML content for debugging
                console.log('XML Content:', xmlContent);
                // Check if the content starts with <?xml
                if (!xmlContent.trim().startsWith('<?xml')) {
                    return res.status(400).json({ message: "Invalid XML file: Missing XML declaration" });
                }
            }
            catch (error) {
                console.error('Error reading file:', error);
                return res.status(400).json({ message: "Error reading the uploaded file" });
            }
            let parsedParcels;
            try {
                console.log('Attempting to parse XML content:', xmlContent);
                parsedParcels = await xmlParser_1.xmlParser.parseXML(xmlContent);
                console.log('Parsed parcels:', JSON.stringify(parsedParcels, null, 2));
                console.log('Parsed parcels count:', parsedParcels.length);
            }
            catch (error) {
                console.error('XML parsing error:', error);
                return res.status(400).json({
                    message: `Failed to parse XML file: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
            // Clean up uploaded file
            try {
                await fs.unlink(req.file.path);
            }
            catch (error) {
                console.error('Failed to cleanup uploaded file:', req.file.path, error);
            }
            if (!parsedParcels || parsedParcels.length === 0) {
                return res.status(400).json({ message: "No valid parcels found in the XML file" });
            }
            const processedParcels = [];
            const errors = [];
            console.log('Starting parcel processing...');
            for (const parsedParcel of parsedParcels) {
                try {
                    console.log('Processing parcel:', JSON.stringify(parsedParcel, null, 2));
                    const insertParcel = xmlParser_1.xmlParser.convertToInsertParcel(parsedParcel);
                    console.log('Converted to insert format:', JSON.stringify(insertParcel, null, 2));
                    const parcel = await businessRules_1.businessRulesEngine.processParcel(insertParcel);
                    console.log('Successfully processed parcel:', JSON.stringify(parcel, null, 2));
                    processedParcels.push(parcel);
                }
                catch (error) {
                    console.error('Error processing parcel:', parsedParcel.parcelId, error);
                    errors.push({
                        parcelId: parsedParcel.parcelId,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }
            console.log('Finished processing parcels. Success:', processedParcels.length, 'Errors:', errors.length);
            res.json({
                message: `Processed ${processedParcels.length} parcels${errors.length > 0 ? ` (${errors.length} errors)` : ''}`,
                parcels: processedParcels,
                errors: errors.length > 0 ? errors : undefined
            });
        }
        catch (error) {
            console.error('Error in upload-xml endpoint:', error);
            res.status(500).json({
                message: error instanceof Error ? error.message : "An unexpected error occurred while processing the file"
            });
        }
    });
    // Approve insurance for parcel
    app.post("/api/parcels/:parcelId/approve-insurance", async (req, res) => {
        try {
            const parcel = await businessRules_1.businessRulesEngine.approveInsurance(req.params.parcelId);
            if (!parcel) {
                return res.status(404).json({ message: "Parcel not found" });
            }
            res.json(parcel);
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    // Complete parcel processing
    app.post("/api/parcels/:parcelId/complete", async (req, res) => {
        try {
            const parcel = await businessRules_1.businessRulesEngine.completeProcessing(req.params.parcelId);
            if (!parcel) {
                return res.status(404).json({ message: "Parcel not found" });
            }
            res.json(parcel);
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    // Reset data
    app.post("/api/reset", async (_req, res) => {
        try {
            await storage_1.storage.resetToDefaults();
            res.json({ message: "All data has been reset to defaults" });
        }
        catch (error) {
            res.status(500).json({
                message: error instanceof Error ? error.message : "An unexpected error occurred"
            });
        }
    });
    // Get dashboard metrics
    app.get("/api/dashboard/metrics", async (req, res) => {
        try {
            const allParcels = await storage_1.storage.getAllParcels();
            const metrics = {
                totalParcels: allParcels.length,
                processed: allParcels.filter(p => p.status === 'completed').length,
                pendingInsurance: allParcels.filter(p => p.status === 'insurance_review').length,
                errors: allParcels.filter(p => p.status === 'error').length,
                departments: {
                    mail: {
                        count: allParcels.filter(p => p.department === 'mail').length,
                        processed: allParcels.filter(p => p.department === 'mail' && p.status === 'completed').length,
                        pending: allParcels.filter(p => p.department === 'mail' && p.status !== 'completed').length
                    },
                    regular: {
                        count: allParcels.filter(p => p.department === 'regular').length,
                        processed: allParcels.filter(p => p.department === 'regular' && p.status === 'completed').length,
                        pending: allParcels.filter(p => p.department === 'regular' && p.status !== 'completed').length
                    },
                    heavy: {
                        count: allParcels.filter(p => p.department === 'heavy').length,
                        processed: allParcels.filter(p => p.department === 'heavy' && p.status === 'completed').length,
                        pending: allParcels.filter(p => p.department === 'heavy' && p.status !== 'completed').length
                    },
                    insurance: {
                        count: allParcels.filter(p => p.requiresInsurance).length,
                        approved: allParcels.filter(p => p.requiresInsurance && p.insuranceApproved).length,
                        reviewing: allParcels.filter(p => p.requiresInsurance && !p.insuranceApproved).length
                    }
                }
            };
            res.json(metrics);
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    // Get business rules
    app.get("/api/business-rules", async (req, res) => {
        try {
            const rules = await businessRules_1.businessRulesEngine.getCurrentRules();
            res.json(rules);
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    // Update business rules
    app.put("/api/business-rules", async (req, res) => {
        try {
            await businessRules_1.businessRulesEngine.updateRules(req.body);
            const updatedRules = await businessRules_1.businessRulesEngine.getCurrentRules();
            res.json(updatedRules);
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    // Get all departments
    app.get("/api/departments", async (req, res) => {
        try {
            const departments = await storage_1.storage.getAllDepartments();
            res.json(departments);
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    // Create new department
    app.post("/api/departments", async (req, res) => {
        try {
            const validatedData = schema_1.insertDepartmentSchema.parse(req.body);
            const department = await storage_1.storage.createDepartment(validatedData);
            res.status(201).json(department);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid department data", errors: error.errors });
            }
            res.status(500).json({
                message: error instanceof Error ? error.message : "An unexpected error occurred"
            });
        }
    });
    // Delete department
    app.delete("/api/departments/:id", async (req, res) => {
        try {
            const success = await storage_1.storage.deleteDepartment(req.params.id);
            if (!success) {
                return res.status(404).json({ message: "Department not found" });
            }
            res.json({ message: "Department deleted successfully" });
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
        }
    });
    const httpServer = (0, http_1.createServer)(app);
    return httpServer;
}
