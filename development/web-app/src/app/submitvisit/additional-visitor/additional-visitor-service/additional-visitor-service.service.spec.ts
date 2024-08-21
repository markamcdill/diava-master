import { TestBed } from '@angular/core/testing';

import { AdditionalVisitorServiceService } from './additional-visitor-service.service';

describe('AdditionalVisitorServiceService', () => {
  let service: AdditionalVisitorServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdditionalVisitorServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
