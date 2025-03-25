FROM node:20-alpine

WORKDIR /app

# Копируем файлы package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем исходный код приложения
COPY . .

# Компилируем TypeScript в JavaScript
RUN npm run build

# Открываем порт, который использует приложение
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "run", "start:prod"]
