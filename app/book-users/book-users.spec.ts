import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookUsers } from './book-users';

describe('BookUsers', () => {
  let component: BookUsers;
  let fixture: ComponentFixture<BookUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookUsers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookUsers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
