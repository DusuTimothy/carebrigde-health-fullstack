import { getSequelize } from '../config/database.js';
import { successResponse, createdResponse, listResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/errors.js';
import { attachImages, attachSingleImage } from '../utils/images.js';

const SITE_CONTENT_KEYS = [
  'serviceLines',
  'bookingSpecialties',
  'community',
  'facilities',
  'labInstruments',
  'departmentsCatalog',
  'contactChannels',
  'stats',
];

export const publicSite = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const [articles, locations, clinicalTrials, stories, departments, contents] = await Promise.all([
      models.Article.findAll({ order: [['date', 'DESC']] }),
      models.Location.findAll(),
      models.ClinicalTrial.findAll(),
      models.Story.findAll({ order: [['date', 'DESC']] }),
      models.Department.findAll({ order: [['name', 'ASC']] }),
      models.SiteContent.findAll({ where: { key: SITE_CONTENT_KEYS } }),
    ]);

    const siteContents = {};
    contents.forEach((content) => {
      siteContents[content.key] = content.value;
    });

    const articlePlain = articles.map((a) => a.toJSON());
    await attachImages(models, 'article', articlePlain);

    return successResponse(res, {
      articles: articlePlain,
      locations,
      clinicalTrials,
      stories,
      departments,
      siteContents,
    });
  } catch (error) {
    return next(error);
  }
};

const doctorInclude = (models) => [
  { model: models.User, as: 'user', attributes: ['id', 'name', 'email', 'role', 'phone'] },
  { model: models.Department, as: 'department' },
];

export const listDoctorsPublic = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const doctors = await models.Doctor.findAll({
      include: doctorInclude(models),
      order: [['lastName', 'ASC']],
    });
    const plain = doctors.map((d) => d.toJSON());
    await attachImages(models, 'doctor', plain);
    return listResponse(res, plain);
  } catch (error) {
    return next(error);
  }
};

export const listProductsPublic = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const products = await models.Product.findAll({
      where: { status: 'active' },
      include: [{ model: models.ProductCategory, as: 'category' }],
      order: [['name', 'ASC']],
    });
    const plain = products.map((p) => p.toJSON());
    await attachImages(models, 'product', plain);
    return listResponse(res, plain);
  } catch (error) {
    return next(error);
  }
};

export const listWardsPublic = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const wards = await models.Ward.findAll({
      include: [{ model: models.Department, as: 'department' }, { model: models.Bed, as: 'beds' }],
      order: [['name', 'ASC']],
    });
    const plain = wards.map((w) => w.toJSON());
    await attachImages(models, 'ward', plain);
    return listResponse(res, plain);
  } catch (error) {
    return next(error);
  }
};

export const listArticles = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const where = req.query.category ? { category: req.query.category } : {};
    const articles = await models.Article.findAll({
      where,
      order: [['date', 'DESC']],
    });
    const plain = articles.map((a) => a.toJSON());
    await attachImages(models, 'article', plain);
    return listResponse(res, plain);
  } catch (error) {
    return next(error);
  }
};

export const getArticle = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const article = await models.Article.findByPk(req.params.id);
    if (!article) {
      throw ApiError.notFound('Article not found.');
    }
    const plain = article.toJSON();
    await attachSingleImage(models, 'article', plain);
    return successResponse(res, plain);
  } catch (error) {
    return next(error);
  }
};

export const createArticle = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const article = await models.Article.create(req.body);
    return createdResponse(res, article.toJSON(), 'Article created successfully.');
  } catch (error) {
    return next(error);
  }
};

export const updateArticle = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const article = await models.Article.findByPk(req.params.id);
    if (!article) {
      throw ApiError.notFound('Article not found.');
    }
    await article.update(req.body);
    const plain = (await article.reload()).toJSON();
    await attachSingleImage(models, 'article', plain);
    return successResponse(res, plain, 'Article updated successfully.');
  } catch (error) {
    return next(error);
  }
};

export const deleteArticle = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const article = await models.Article.findByPk(req.params.id);
    if (!article) {
      throw ApiError.notFound('Article not found.');
    }
    await article.destroy();
    return successResponse(res, null, 'Article deleted.');
  } catch (error) {
    return next(error);
  }
};

export const createStoryPublic = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    const { name, title, tag, quote } = req.body;
    const story = await models.Story.create({
      name: name.trim(),
      title: title || null,
      tag: tag || 'Patient story',
      quote: quote.trim(),
      date: new Date().toISOString().slice(0, 10),
    });
    return createdResponse(res, story.toJSON(), 'Thank you! Your story has been shared.');
  } catch (error) {
    return next(error);
  }
};

export const subscribeNewsletter = async (req, res, next) => {
  try {
    const models = getSequelize().models;
    let entry = await models.SiteContent.findOne({ where: { key: 'newsletterSubscribers' } });
    if (!entry) {
      entry = await models.SiteContent.create({ key: 'newsletterSubscribers', value: [] });
    }
    const subscribers = Array.isArray(entry.value) ? entry.value : [];
    if (!subscribers.some((s) => s.email === req.body.email)) {
      subscribers.unshift({ email: req.body.email, at: new Date().toISOString() });
      entry.value = subscribers;
      await entry.save();
    }
    return successResponse(res, null, 'Thanks for subscribing. You are on the list!');
  } catch (error) {
    return next(error);
  }
};