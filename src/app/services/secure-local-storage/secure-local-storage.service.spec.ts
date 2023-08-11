import { TestBed } from '@angular/core/testing';

import { SecureLocalStorageService } from './secure-local-storage.service';

describe('SecureLocalStorageService', () => {
  let service: SecureLocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecureLocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
