const toMetaString = (meta) => {
  if (!meta || Object.keys(meta).length === 0) {
    return '';
  }

  return ` ${JSON.stringify(meta)}`;
};

const createLogger = (context) => ({
  info(message, meta = {}) {
    console.log(`[${context}] ${message}${toMetaString(meta)}`);
  },
  error(message, meta = {}) {
    console.error(`[${context}] ${message}${toMetaString(meta)}`);
  },
});

module.exports = { createLogger };
