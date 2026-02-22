const JIKAN_URL = 'https://api.jikan.moe/v4';
const ANIMEFLV_URL = 'https://animeflv.ahmedrangel.com/api';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  /**
   * Obtiene detalles completos de AnimeFLV (incluyendo lista de episodios).
   */
  getAnimeFLVDetails: async (slug) => {
    try {
      const response = await fetch(`${ANIMEFLV_URL}/anime/${slug}`);
      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error(`Error details from AnimeFLV for ${slug}:`, error);
      return null;
    }
  },

  /**
   * Helper para buscar el slug de un anime en AnimeFLV usando su título.
   */
  getAnimeFLVSlug: async (title) => {
    try {
      const response = await fetch(`${ANIMEFLV_URL}/search?query=${encodeURIComponent(title)}`);
      const result = await response.json();
      if (result.success && result.data && result.data.media && result.data.media.length > 0) {
        return result.data.media[0].slug;
      }
      return null;
    } catch (error) {
      console.error(`Error searching AnimeFLV slug for ${title}:`, error);
      return null;
    }
  },

  /**
   * Filtra una lista de animes dejando solo los que tienen disponibilidad en AnimeFLV.
   */
  filterByAvailability: async (animeList) => {
    if (!animeList || animeList.length === 0) return [];

    // Check in parallel
    const checks = await Promise.all(
      animeList.map(async (anime) => {
        const slug = await api.getAnimeFLVSlug(anime.title);
        return slug ? anime : null;
      })
    );

    return checks.filter(Boolean);
  },

  /**
   * Obtiene los episodios más recientes (Jikan).
   */
  getLatestEpisodes: async () => {
    try {
      const response = await fetch(`${JIKAN_URL}/watch/episodes`);
      const result = await response.json();
      if (!result.data) return [];
      return result.data.map(item => ({
        id: item.entry.mal_id,
        title: item.entry.title,
        cover: item.entry.images.webp.large_image_url,
        number: item.episodes[0]?.mal_id || 1,
        slug: item.entry.mal_id
      }));
    } catch (error) {
      console.error('Error fetching latest episodes:', error);
      return [];
    }
  },

  /**
   * Obtiene los animes de la temporada actual.
   */
  getAiringAnime: async () => {
    try {
      const response = await fetch(`${JIKAN_URL}/seasons/now?limit=20`);
      const result = await response.json();
      if (!result.data) return [];

      const availableData = result.data.filter(item => item.status !== 'Not yet aired');
      const verifiedData = await api.filterByAvailability(availableData);

      return verifiedData.map(item => ({
        id: item.mal_id,
        title: item.title,
        cover: item.images.webp.large_image_url,
        synopsis: item.synopsis,
        rating: item.score,
        year: item.year,
        genres: item.genres?.map(g => g.name) || [],
        type: item.type,
        slug: item.mal_id
      }));
    } catch (error) {
      console.error('Error fetching airing anime:', error);
      return [];
    }
  },

  /**
   * Obtiene los animes más populares.
   * @param {string} type - Opcional: 'tv', 'movie', etc.
   * @param {number} page - Página del paginado.
   */
  getPopularAnime: async (type = '', page = 1) => {
    try {
      await delay(500);
      let url = `${JIKAN_URL}/top/anime?page=${page}&limit=20`;
      if (type) {
        url += `&type=${type}`;
      }

      const response = await fetch(url);
      const result = await response.json();
      if (!result.data) return { data: [], pagination: {} };

      const availableData = result.data.filter(item => item.status !== 'Not yet aired');

      return {
        data: availableData.map(item => ({
          id: item.mal_id,
          title: item.title,
          cover: item.images.webp.large_image_url,
          synopsis: item.synopsis,
          rating: item.score,
          year: item.year,
          genres: item.genres?.map(g => g.name) || [],
          type: item.type,
          slug: item.mal_id
        })),
        pagination: result.pagination
      };
    } catch (error) {
      console.error(`Error fetching popular anime (${type}):`, error);
      return { data: [], pagination: {} };
    }
  },

  /**
   * Obtiene los detalles de un anime específico (Jikan).
   */
  getAnimeBySlug: async (id) => {
    try {
      // Retraso para evitar 429 si se llama junto con otros
      await delay(1000);
      const response = await fetch(`${JIKAN_URL}/anime/${id}/full`);
      const result = await response.json();
      const item = result.data;
      if (!item) return null;
      return {
        id: item.mal_id,
        title: item.title,
        cover: item.images.webp.large_image_url,
        synopsis: item.synopsis,
        rating: item.score,
        status: item.status,
        type: item.type,
        genres: item.genres?.map(g => g.name) || [],
        episodes_count: item.episodes,
        trailer: item.trailer?.embed_url,
        episodes: Array.from({ length: item.episodes || 12 }, (_, i) => ({
          number: i + 1,
          id: i + 1
        })),
        relations: item.relations || []
      };
    } catch (error) {
      console.error(`Error fetching anime ${id}:`, error);
      return null;
    }
  },

  /**
   * Obtiene los servidores reales de AnimeFLV.
   * @param {string} mal_id - ID de MyAnimeList.
   * @param {number} episodeNumber - Número del episodio.
   * @param {string} title - Título del anime para mapear.
   */
  getEpisodeServers: async (mal_id, episodeNumber, title) => {
    try {
      if (!title) {
        // Si no hay título, intentamos obtenerlo (aunque lo ideal es que ya venga)
        const anime = await api.getAnimeBySlug(mal_id);
        title = anime?.title;
      }
      if (!title) return [];
      const flvSlug = await api.getAnimeFLVSlug(title);
      if (!flvSlug) {
        console.warn(`No se encontró slug de AnimeFLV para: ${title}`);
        return [];
      }
      const response = await fetch(`${ANIMEFLV_URL}/anime/${flvSlug}/episode/${episodeNumber}`);
      const result = await response.json();

      if (result.success && result.data && result.data.servers) {
        return result.data.servers.map(server => ({
          name: server.name,
          embed: server.embed
        }));
      }
      return [];
    } catch (error) {
      console.error(`Error fetching hybrid servers for ${title}:`, error);
      return [];
    }
  },

  /**
   * Busca animes (Jikan).
   */
  /**
   * Busca animes primero en AnimeFLV y luego enriquece con Jikan.
   */
  searchAnime: async (query, page = 1) => {
    try {
      // 1. Search in AnimeFLV
      const flvResponse = await fetch(`${ANIMEFLV_URL}/search?query=${encodeURIComponent(query)}`);
      const flvResult = await flvResponse.json();

      const flvMedia = (flvResult.success && flvResult.data && flvResult.data.media)
        ? flvResult.data.media
        : [];

      if (flvMedia.length === 0) return { media: [], foundPages: 0 };

      // Pagination simulation (since FLV search might return all matches)
      const ITEMS_PER_PAGE = 20;
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const paginatedMedia = flvMedia.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      // 2. Enrich with Jikan Data (to get MAL ID)
      const enrichedResults = await Promise.all(
        paginatedMedia.map(async (flvItem) => {
          try {
            // Delay to respect Jikan Rate Limit
            await delay(300);
            // Strict search in Jikan by title
            const jikanResponse = await fetch(`${JIKAN_URL}/anime?q=${encodeURIComponent(flvItem.title)}&limit=1`);
            const jikanResult = await jikanResponse.json();

            const jikanItem = jikanResult.data && jikanResult.data.length > 0 ? jikanResult.data[0] : null;

            if (jikanItem) {
              return {
                id: jikanItem.mal_id,
                title: flvItem.title, // Keep FLV title or Jikan? Jikan usually better formatting
                cover: jikanItem.images.webp.large_image_url || flvItem.cover,
                synopsis: jikanItem.synopsis,
                rating: jikanItem.score,
                slug: jikanItem.mal_id, // App uses ID as slug for Jikan architecture
                type: jikanItem.type,
                flv_slug: flvItem.slug // Store FLV slug for potential use
              };
            }

            // Fallback if not found in Jikan (Optional: Skip or show without ID?)
            // If we don't have MAL ID, we can't load details in current architecture.
            // So we skip.
            return null;
          } catch (e) {
            console.error('Error enriching item:', flvItem.title);
            return null;
          }
        })
      );

      return {
        media: enrichedResults.filter(Boolean),
        foundPages: Math.ceil(flvMedia.length / ITEMS_PER_PAGE),
        pagination: {
          has_next_page: (startIndex + ITEMS_PER_PAGE) < flvMedia.length,
          last_visible_page: Math.ceil(flvMedia.length / ITEMS_PER_PAGE)
        }
      };

    } catch (error) {
      console.error(`Error searching for ${query}:`, error);
      return { media: [], foundPages: 0 };
    }
  },

  /**
   * Obtiene la lista de géneros disponibles.
   */
  getGenres: async () => {
    try {
      const response = await fetch(`${JIKAN_URL}/genres/anime`);
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching genres:', error);
      return [];
    }
  },

  /**
   * Obtiene animes filtrados por género.
   */
  getAnimeByGenre: async (genreId, page = 1) => {
    try {
      await delay(500);
      const response = await fetch(`${JIKAN_URL}/anime?genres=${genreId}&page=${page}&order_by=score&sort=desc`);
      const result = await response.json();
      if (!result.data) return { data: [], pagination: {} };

      const availableData = result.data.filter(item => item.status !== 'Not yet aired');

      return {
        data: availableData.map(item => ({
          id: item.mal_id,
          title: item.title,
          cover: item.images.webp.large_image_url,
          synopsis: item.synopsis,
          rating: item.score,
          year: item.year,
          genres: item.genres?.map(g => g.name) || [],
          type: item.type,
          slug: item.mal_id
        })),
        pagination: result.pagination
      };
    } catch (error) {
      console.error(`Error fetching anime by genre ${genreId}:`, error);
      return { data: [], pagination: {} };
    }
  },

  /**
   * Obtiene videos y thumbnails de episodios (Jikan).
   */
  getAnimeVideos: async (id) => {
    try {
      await delay(500);
      const response = await fetch(`${JIKAN_URL}/anime/${id}/videos`);
      const result = await response.json();
      if (!result.data || !result.data.episodes) return [];
      return result.data.episodes.map(episode => ({
        number: episode.mal_id,
        title: episode.title,
        image: episode.images?.jpg?.image_url
      }));
    } catch (error) {
      console.error(`Error fetching videos for anime ${id}:`, error);
      return [];
    }
  }
};