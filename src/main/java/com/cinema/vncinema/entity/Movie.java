package com.cinema.vncinema.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "movies")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Movie extends BaseEntity {

    @Column(name = "tmdb_id", unique = true)
    private Long tmdbId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "original_title")
    private String originalTitle;

    @Column(name = "overview", columnDefinition = "TEXT")
    private String overview;

    @Column(name = "duration", nullable = false)
    private Integer duration;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "poster_path")
    private String posterPath;

    @Column(name = "backdrop_path")
    private String backdropPath;

    @Column(name = "trailer_url")
    private String trailerUrl;

    @Column(name = "cast_info", columnDefinition = "TEXT")
    private String cast;

    @Column(name = "director")
    private String director;

    @Column(name = "vote_average")
    private Double voteAverage;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "UPCOMING"; // UPCOMING, NOW_SHOWING, ENDED

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "movie_genres",
        joinColumns = @JoinColumn(name = "movie_id"),
        inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres;
}
