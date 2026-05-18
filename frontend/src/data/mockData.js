export const movies = [
  {
    id: 1,
    title: "Dune: Part Two",
    image: "https://images.unsplash.com/photo-1547333590-bc74900ac9f2?q=80&w=500&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1920&auto=format&fit=crop",
    genre: ["Action", "Adventure", "Sci-Fi"],
    duration: "166 min",
    rating: "8.8",
    releaseDate: "2024-03-01",
    description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Javier Bardem"]
  },
  {
    id: 2,
    title: "Kung Fu Panda 4",
    image: "https://images.unsplash.com/photo-1512413914583-054fc2a05cb8?q=80&w=500&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1533560904424-a0c61dc306fc?q=80&w=1920&auto=format&fit=crop",
    genre: ["Animation", "Action", "Family"],
    duration: "94 min",
    rating: "7.1",
    releaseDate: "2024-03-08",
    description: "Po is gearing up to become the spiritual leader of his Valley of Peace, but also needs someone to take his place as Dragon Warrior. As such, he will train a new kung fu practitioner for the spot and will encounter a villain called the Chameleon who conjures villains from the past.",
    director: "Mike Mitchell",
    cast: ["Jack Black", "Awkwafina", "Viola Davis", "Dustin Hoffman"]
  },
  {
    id: 3,
    title: "Godzilla x Kong: The New Empire",
    image: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=500&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1920&auto=format&fit=crop",
    genre: ["Action", "Sci-Fi", "Adventure"],
    duration: "115 min",
    rating: "7.2",
    releaseDate: "2024-03-29",
    description: "Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world, challenging their very existence – and our own.",
    director: "Adam Wingard",
    cast: ["Rebecca Hall", "Brian Tyree Henry", "Dan Stevens", "Kaylee Hottle"]
  },
  {
    id: 4,
    title: "Civil War",
    image: "https://images.unsplash.com/photo-1534294228306-bd54eb9a7ba8?q=80&w=500&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1505327191481-d3525d0aa92c?q=80&w=1920&auto=format&fit=crop",
    genre: ["Action", "Thriller"],
    duration: "109 min",
    rating: "7.4",
    releaseDate: "2024-04-12",
    description: "A journey across a dystopian future America, following a team of military-embedded journalists as they race against time to reach DC before rebel factions descend upon the White House.",
    director: "Alex Garland",
    cast: ["Kirsten Dunst", "Wagner Moura", "Cailee Spaeny", "Stephen McKinley Henderson"]
  },
  {
    id: 5,
    title: "Oppenheimer",
    image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=500&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1920&auto=format&fit=crop",
    genre: ["Drama", "History"],
    duration: "180 min",
    rating: "8.1",
    releaseDate: "2023-07-19",
    description: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    director: "Christopher Nolan",
    cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."]
  },
  {
    id: 6,
    title: "Poor Things",
    image: "https://images.unsplash.com/photo-1518929468119-e5bf444c30f4?q=80&w=500&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1499540633125-484965b60031?q=80&w=1920&auto=format&fit=crop",
    genre: ["Sci-Fi", "Romance", "Comedy"],
    duration: "141 min",
    rating: "7.8",
    releaseDate: "2023-12-07",
    description: "Brought back to life by an unorthodox scientist, a young woman runs off with a debauched lawyer on a whirlwind adventure across the continents. Free from the prejudices of her times, she grows steadfast in her purpose to stand for equality and liberation.",
    director: "Yorgos Lanthimos",
    cast: ["Emma Stone", "Mark Ruffalo", "Willem Dafoe", "Ramy Youssef"]
  }
];

export const showtimes = [
  { id: 1, time: "10:00 AM", available: true },
  { id: 2, time: "12:30 PM", available: true },
  { id: 3, time: "03:15 PM", available: false },
  { id: 4, time: "06:00 PM", available: true },
  { id: 5, time: "08:45 PM", available: true },
  { id: 6, time: "11:30 PM", available: true },
];

export const generateSeats = () => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 12;
  const seats = [];

  rows.forEach((row, rowIndex) => {
    for (let i = 1; i <= seatsPerRow; i++) {
      const type = rowIndex < 2 ? 'standard' : rowIndex < 8 ? 'premium' : 'vip';
      const price = type === 'standard' ? 50000 : type === 'premium' ? 75000 : 100000;
      seats.push({
        id: `${row}${i}`,
        row,
        number: i,
        status: Math.random() > 0.8 ? 'booked' : 'available',
        type,
        price
      });
    }
  });

  return seats;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};
