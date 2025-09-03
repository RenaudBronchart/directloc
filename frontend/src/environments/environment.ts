export const environment = {
  production: false,
  apiBase: 'http://localhost:8080/',

  markets: [
    {
      key: 'perigord',
      name: 'Périgord Noir',
      country: 'France',
      currency: 'EUR',
      defaultCity: 'Sarlat-la-Canéda',
      cities: [
        'Sarlat-la-Canéda',
        'Domme',
        'La Roque-Gageac',
        'Beynac-et-Cazenac',
        'Montignac-Lascaux'
      ]
    },
    {
      key: 'gironde',
      name: 'Gironde',
      country: 'France',
      currency: 'EUR',
      defaultCity: 'Bordeaux',
      cities: [
        'Bordeaux',
        'Arcachon',
        'Cap Ferret',
        'Libourne',
        'Saint-Émilion'
      ]
    },
    {
      key: 'charente-maritime',
      name: 'Charente-Maritime',
      country: 'France',
      currency: 'EUR',
      defaultCity: 'La Rochelle',
      cities: [
        'La Rochelle',
        'Île de Ré',
        'Royan',
        'Rochefort',
        'Saintes'
      ]
    },
    {
      key: 'landes',
      name: 'Landes',
      country: 'France',
      currency: 'EUR',
      defaultCity: 'Hossegor',
      cities: [
        'Hossegor',
        'Capbreton',
        'Biscarrosse',
        'Mimizan',
        'Dax'
      ]
    },
    {
      key: 'provence',
      name: 'Provence (Bouches-du-Rhône)',
      country: 'France',
      currency: 'EUR',
      defaultCity: 'Marseille',
      cities: [
        'Marseille',
        'Aix-en-Provence',
        'Arles',
        'Cassis',
        'La Ciotat'
      ]
    }
  ],
  defaultMarketKey: 'perigord'
};
