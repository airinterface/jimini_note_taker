import Config from 'react-native-config';

export const baseURL = Config.API_BASE_URL || 'http://localhost:3000/api/v1';
export const environment = Config.ENVIRONMENT || 'production';