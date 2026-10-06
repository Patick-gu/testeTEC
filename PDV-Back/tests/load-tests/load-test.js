import http from 'k6/http';
import { sleep, check } from 'k6';

// Configuração de Estágios de Concorrência
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Acelera até 10 usuários em 30s
    { duration: '1m', target: 10 },   // Mantém 10 usuários por 1 min
    { duration: '30s', target: 100 }, // Sobe para 100 usuários em 30s
    { duration: '1m', target: 100 },  // Mantém 100 usuários por 1 min
    { duration: '30s', target: 500 }, // Sobe para 500 usuários em 30s (Pico)
    { duration: '1m', target: 500 },  // Mantém 500 usuários por 1 min
    { duration: '30s', target: 0 },   // Reduz gradualmente para 0
  ],
  thresholds: {
    // Critérios de Aceitação
    http_req_duration: ['p(95)<1000'], // 95% das requisições devem ocorrer em menos de 1000ms
    http_req_failed: ['rate<0.05'],    // Falhas devem ser menores que 5%
  },
};

export default function () {
  const BASE_URL = 'http://localhost:8001/api';

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  // Testando o endpoint de login (para simular carga no banco de dados e Auth)
  const payload = JSON.stringify({
    email: 'admin@admin.com',
    password: 'password', 
  });

  const res = http.post(`${BASE_URL}/login`, payload, params);

  check(res, {
    'status não é 500 (Internal Server Error)': (r) => r.status !== 500,
    'tempo de resposta < 2s': (r) => r.timings.duration < 2000,
  });

  // O Virtual User espera 1 segundo antes de disparar outra requisição
  sleep(1);
}
