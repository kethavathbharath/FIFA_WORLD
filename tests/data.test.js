/**
 * @file data.test.js
 * @description Unit tests for NexusData Layer
 */

const NexusData = require('../js/data.js');

describe('NexusData Layer Unit Tests', () => {
  
  test('Verify 16 World Cup stadiums exist with valid capacities', () => {
    expect(NexusData.venues).toBeDefined();
    expect(NexusData.venues.length).toBe(16);
    
    NexusData.venues.forEach(venue => {
      expect(venue.id).toBeDefined();
      expect(venue.name).toBeDefined();
      expect(venue.fifaName).toBeDefined();
      expect(venue.capacity).toBeGreaterThan(40000);
      expect(venue.lat).toBeDefined();
      expect(venue.lng).toBeDefined();
    });
  });

  test('Verify 48 group stage teams exist', () => {
    expect(NexusData.teams).toBeDefined();
    expect(NexusData.teams.length).toBe(48);
    
    NexusData.teams.forEach(team => {
      expect(team.name).toBeDefined();
      expect(team.code).toBeDefined();
      expect(team.flag).toBeDefined();
      expect(team.group).toBeDefined();
    });
  });

  test('Verify getSimulatedCrowdData returns correct bounds', () => {
    const data = NexusData.getSimulatedCrowdData('metlife');
    
    expect(data).toBeDefined();
    expect(data.venueId).toBe('metlife');
    expect(data.capacity).toBe(80663);
    expect(data.totalCurrent).toBeGreaterThan(0);
    expect(data.occupancy).toBeGreaterThanOrEqual(0.3);
    expect(data.occupancy).toBeLessThanOrEqual(1.0);
    expect(data.zones.length).toBe(13); // 13 zones in zoneTemplate
  });

  test('Verify translateText maps native announcements correctly', () => {
    const text = 'Welcome to the FIFA World Cup 2026! Enjoy the match.';
    
    const spanish = NexusData.translateText(text, 'es');
    const french = NexusData.translateText(text, 'fr');
    
    expect(spanish).toBe('¡Bienvenidos a la Copa Mundial de la FIFA 2026! Disfruten del partido.');
    expect(french).toBe('Bienvenue à la Coupe du Monde de la FIFA 2026 ! Profitez du match.');
  });

  test('Verify getAIResponse matches expected keywords', () => {
    const responseCrowd = NexusData.getAIResponse('What is the crowd density?');
    const responseSec = NexusData.getAIResponse('Show security status');
    
    expect(responseCrowd.key).toBe('crowd');
    expect(responseSec.key).toBe('security');
    
    expect(responseCrowd.text).toBeDefined();
    expect(responseSec.text).toBeDefined();
    expect(responseCrowd.confidence).toBe('high');
  });

  test('Verify simulated operational datasets exist', () => {
    expect(NexusData.getSimulatedMatches().length).toBeGreaterThan(0);
    expect(NexusData.getSimulatedAlerts().length).toBeGreaterThan(0);
    expect(NexusData.getSimulatedStaffData().totalDeployed).toBeGreaterThan(0);
    expect(NexusData.getSimulatedIncidents().length).toBeGreaterThan(0);
    expect(NexusData.getSimulatedFacilities().length).toBeGreaterThan(0);
  });
});
