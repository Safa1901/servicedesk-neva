import axios from 'axios';

const DOCS_BASE_URL = 'http://83.239.34.214:3010';

const docsClient = axios.create({
  baseURL: DOCS_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const fetchDocuments = async ({ database, accounts, dateFrom, dateTo }) => {
  const dbPath = database === 'buh3' ? 'buh3_lk' : 'vse_ip_lk';

  try {
    const response = await docsClient.post(`/${dbPath}/hs/lk/docs`, {
      accounts,
      date_from: dateFrom,
      date_to: dateTo,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const message = error.response.data?.message || 'Ошибка сервера';
      throw new Error(Array.isArray(message) ? message.join(', ') : message);
    } else if (error.request) {
      throw new Error('Нет соединения с сервером');
    } else {
      throw new Error(error.message || 'Ошибка при выполнении запроса');
    }
  }
};
