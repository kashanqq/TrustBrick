export interface ProjectConfig {
  id: number;
  slug: string;
  name: string;
  location: string;
  totalGoal: number;
  yieldInfo: string;
  series: string;
  previewImage: string;
  mintPriceSol: number;
  mintAddress: string;
}

export const PROJECTS: ProjectConfig[] = [
  {
    id: 101, // Смарт-контракт Project_ID
    slug: "almaty-hub", // Роут для API
    name: "Almaty Financial District",
    location: "Almaty, Kazakhstan",
    totalGoal: 50,
    yieldInfo: "12.5% Target Yield",
    series: "Series A",
    previewImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuC17S9hOE0DWk7ymSuzqfgieEVI2TPQT6kAuCkxluNPxY1NCIZqK8xp99QYwDcGdQmgIHiiSRNpRx8CjaqGZO-gTgfdjfm_4D10frAKQxfWhLSaqeqZCEw8CFZRFdczwOD1tMxXjcJQxxs1J9Q-9wjr8so0JP_ecyPQS7_9hmA1BTrJDm-9xxZ4KXDOqzI5DfIEIELI2_m2vhO-KRdt1WUIf7V8YMJWRhvFleCWEM8Szn39HMJRvm7S1U1ZU6-JQzecbzPS6u7aNZzj",
    mintPriceSol: 1,
    mintAddress: process.env.ALMATY_MINT || "8FW9bi919pjVCWVQJfTKDUxFmT5Nuz9xWBCR5fyGiS87",
  },
  {
    id: 102,
    slug: "astana-plaza",
    name: "Astana Hub Plaza",
    location: "Astana, Kazakhstan",
    totalGoal: 100,
    yieldInfo: "8.4% Target Yield",
    series: "Exclusive Phase",
    previewImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8-Ow4CT9O_b08CJzLH74d60idNlxIoBH7UzkjQS-vx7xqBbcH45NyTKJTKCpJpHIZes0MLfvZFr9Zd4IXP7OHljfP7mh511HMDph6zc4CbnD_Z3VhDc6SmGMyMVlOwGpoK4s42k6a4eEfi9HA3xeQIJEL5QUH7AI38EhLBNqwp-h8Kmp2-h-Vgn0YGz7D5Z3t6QI3qppS98eKFbvkV00_IIdJf_jsUGlWcjXofSU8wP18zEaHBdACT3UHNPaj_01ZGBVWLRfsXuI",
    mintPriceSol: 2,
    mintAddress: process.env.ASTANA_MINT || "7gfjrTPgWi7uPzE6o6C9PomwLsCfLu9mDFm3U7yUVJCb",
  },
  {
    id: 103,
    slug: "atyrau-logistics",
    name: "Atyrau Logistics Park",
    location: "Atyrau, Kazakhstan",
    totalGoal: 150,
    yieldInfo: "10.0% Target Yield",
    series: "Commercial",
    previewImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8dhyW0mXM41Gavbw1-FEbARJsV6z4ludx-CBAV7CiOtSjcmMQvUmwX-IMhZjUtWWGrhmJr__-lo7a5W2h0n-c-7vczOXkXlQCgnGpgHBfGIzHZJOgOu7sg-ci39EuPHe_G5rewSNLsgdzWYVOAQ_u2bc4cLGvg95S9VowAahw9euqdOf7-D4k_l6Nura4ZeL9-8LJWFHOqZ5eQ6BV_Vze5U8XGzYonEYhK42z87q5gSXMlQcEd13VYXx2VglvuRyLvY-f_o-cw9d-",
    mintPriceSol: 1.5,
    mintAddress: process.env.ATYRAU_MINT || "FcUHXi4T59r5fq5XganALMZQMw96EZoCKk3Mu7SvU2bb",
  }
];

export function getProjectById(id: number) {
  return PROJECTS.find((p) => p.id === id);
}

export function getProjectBySlug(slug: string) {
  return PROJECTS.find((p) => p.slug === slug);
}
