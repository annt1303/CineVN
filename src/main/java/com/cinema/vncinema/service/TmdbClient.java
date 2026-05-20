package com.cinema.vncinema.service;

import com.cinema.vncinema.dto.response.TmdbMovieDetailResponse;
import com.cinema.vncinema.dto.response.TmdbSearchResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class TmdbClient {

    private final RestTemplate restTemplate = new RestTemplate(new JdkClientHttpRequestFactory());

    @Value("${tmdb.api.token}")
    private String apiToken;

    @Value("${tmdb.api.base-url}")
    private String baseUrl;

    private HttpEntity<String> getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiToken);
        return new HttpEntity<>(headers);
    }

    public TmdbSearchResponse searchMovies(String query, int page) {
        String url = baseUrl + "/search/movie?query=" + query + "&language=vi-VN&page=" + page;
        try {
            log.info("========== TMDB REQUEST ==========");
            log.info("URL: {}", url);
            log.info("Method: GET");

            ResponseEntity<TmdbSearchResponse> response = restTemplate.exchange(
                url, HttpMethod.GET, getHeaders(), TmdbSearchResponse.class);

            log.info("========== TMDB SUCCESS ==========");
            log.info("Status: {}", response.getStatusCode());
            return response.getBody();
        } catch (HttpStatusCodeException e) {
            log.error("========== TMDB HTTP ERROR ==========");
            log.error("Status Code: {}", e.getStatusCode());
            log.error("Response Body: {}", e.getResponseBodyAsString());
            log.error("Message: {}", e.getMessage(), e);
            throw e;
        } catch (RestClientException e) {
            log.error("========== TMDB CLIENT ERROR ==========");
            log.error("Message: {}", e.getMessage(), e);
            throw e;
        }
    }

    public TmdbSearchResponse getNowPlayingMovies(int page) {
        String url = baseUrl + "/movie/now_playing?language=vi-VN&page=" + page + "&region=VN";
        try {
            log.info("========== TMDB REQUEST ==========");
            log.info("URL: {}", url);
            log.info("Method: GET");

            ResponseEntity<TmdbSearchResponse> response = restTemplate.exchange(
                url, HttpMethod.GET, getHeaders(), TmdbSearchResponse.class);

            log.info("========== TMDB SUCCESS ==========");
            log.info("Status: {}", response.getStatusCode());
            return response.getBody();
        } catch (HttpStatusCodeException e) {
            log.error("========== TMDB HTTP ERROR ==========");
            log.error("Status Code: {}", e.getStatusCode());
            log.error("Response Body: {}", e.getResponseBodyAsString());
            log.error("Message: {}", e.getMessage(), e);
            throw e;
        } catch (RestClientException e) {
            log.error("========== TMDB CLIENT ERROR ==========");
            log.error("Message: {}", e.getMessage(), e);
            throw e;
        }
    }

    public TmdbSearchResponse getUpcomingMovies(int page) {
        String url = baseUrl + "/movie/upcoming?language=vi-VN&page=" + page + "&region=VN";
        try {
            log.info("========== TMDB REQUEST ==========");
            log.info("URL: {}", url);
            log.info("Method: GET");

            ResponseEntity<TmdbSearchResponse> response = restTemplate.exchange(
                url, HttpMethod.GET, getHeaders(), TmdbSearchResponse.class);

            log.info("========== TMDB SUCCESS ==========");
            log.info("Status: {}", response.getStatusCode());
            return response.getBody();
        } catch (HttpStatusCodeException e) {
            log.error("========== TMDB HTTP ERROR ==========");
            log.error("Status Code: {}", e.getStatusCode());
            log.error("Response Body: {}", e.getResponseBodyAsString());
            log.error("Message: {}", e.getMessage(), e);
            throw e;
        } catch (RestClientException e) {
            log.error("========== TMDB CLIENT ERROR ==========");
            log.error("Message: {}", e.getMessage(), e);
            throw e;
        }
    }

    public TmdbMovieDetailResponse getMovieDetails(Long tmdbId) {
        String url = baseUrl + "/movie/" + tmdbId + "?language=vi-VN&append_to_response=videos,credits";
        try {
            log.info("========== TMDB REQUEST ==========");
            log.info("URL: {}", url);
            log.info("Method: GET");

            ResponseEntity<TmdbMovieDetailResponse> response = restTemplate.exchange(
                url, HttpMethod.GET, getHeaders(), TmdbMovieDetailResponse.class);

            log.info("========== TMDB SUCCESS ==========");
            log.info("Status: {}", response.getStatusCode());
            return response.getBody();
        } catch (HttpStatusCodeException e) {
            log.error("========== TMDB HTTP ERROR ==========");
            log.error("Status Code: {}", e.getStatusCode());
            log.error("Response Body: {}", e.getResponseBodyAsString());
            log.error("Message: {}", e.getMessage(), e);
            throw e;
        } catch (RestClientException e) {
            log.error("========== TMDB CLIENT ERROR ==========");
            log.error("Message: {}", e.getMessage(), e);
            throw e;
        }
    }
}
