/**
 * Turns a query string into a chained Mongoose query: filtering, text search,
 * sorting, field selection and pagination — shared by every module's "list"
 * endpoint via the controller factory.
 *
 * Supported query params:
 *   ?page=2&limit=20                  pagination
 *   ?sort=-createdAt,name             sort (comma-separated, "-" = desc)
 *   ?fields=name,price                projection
 *   ?search=inverter                  regex search across `searchableFields`
 *   ?price[gte]=1000&price[lte]=5000  range filters on any schema field
 *   ?status=active                    exact-match filter on any schema field
 */
export class APIFeatures {
  constructor(query, queryString, { searchableFields = [] } = {}) {
    this.query = query;
    this.queryString = queryString;
    this.searchableFields = searchableFields;
    this.paginationInfo = { page: 1, limit: 20, total: 0, pages: 0 };
  }

  filter() {
    const excluded = ['page', 'sort', 'limit', 'fields', 'search'];
    const queryObj = { ...this.queryString };
    excluded.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|ne|in)\b/g, (match) => `$${match}`);
    const parsed = JSON.parse(queryStr);

    // `in` filters arrive as comma-separated strings (?category[in]=a,b) — split them.
    Object.values(parsed).forEach((v) => {
      if (v && typeof v === 'object' && typeof v.$in === 'string') {
        v.$in = v.$in.split(',');
      }
    });

    this.query = this.query.find(parsed);
    return this;
  }

  search() {
    const term = this.queryString.search;
    if (term && this.searchableFields.length) {
      const regex = new RegExp(term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      this.query = this.query.find({ $or: this.searchableFields.map((field) => ({ [field]: regex })) });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  async paginate() {
    const page = Math.max(1, Number(this.queryString.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(this.queryString.limit) || 20));
    const skip = (page - 1) * limit;

    // Count against the filtered query before pagination is applied to it.
    const total = await this.query.model.countDocuments(this.query.getFilter());

    this.query = this.query.skip(skip).limit(limit);
    this.paginationInfo = { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) };
    return this;
  }
}
