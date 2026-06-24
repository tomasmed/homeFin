import random
from datetime import date, timedelta
from decimal import Decimal
from uuid import uuid4

from sqlmodel import Session, select
from app.models.base import SessionLocal
from app.models.account import Account, AccountType
from app.models.category import Category, seed_categories
from app.models.transaction import Transaction


def seed_database():
    session = SessionLocal()
    try:
        print("🌱 Seeding database...")
        
        # 1. Clear existing transactions and accounts
        print("🧹 Clearing old data...")
        session.exec(select(Transaction)).all()  # Warm up / check
        for t in session.exec(select(Transaction)).all():
            session.delete(t)
        for a in session.exec(select(Account)).all():
            session.delete(a)
        session.commit()

        # 2. Ensure categories exist and load them
        print("📁 Seeding and loading categories...")
        seed_categories(session)
        categories = {c.name: c for c in session.exec(select(Category)).all()}

        # 3. Create realistic accounts
        print("🏦 Creating accounts...")
        chase_checking = Account(
            id=str(uuid4()),
            name="Chase Checking",
            institution="Chase Bank",
            account_type=AccountType.checking,
            currency="USD"
        )
        boa_savings = Account(
            id=str(uuid4()),
            name="BoA Savings",
            institution="Bank of America",
            account_type=AccountType.savings,
            currency="USD"
        )
        amex_card = Account(
            id=str(uuid4()),
            name="Amex Blue Cash",
            institution="American Express",
            account_type=AccountType.credit,
            currency="USD"
        )
        vanguard_brokerage = Account(
            id=str(uuid4()),
            name="Vanguard Brokerage",
            institution="Vanguard",
            account_type=AccountType.investment,
            currency="USD"
        )

        session.add(chase_checking)
        session.add(boa_savings)
        session.add(amex_card)
        session.add(vanguard_brokerage)
        session.commit()

        # 4. Generate transactions for the last 30 days
        print("💸 Generating transactions...")
        today = date.today()
        transactions = []

        # Chase Checking: Income & Fixed Expenses
        # Salary bi-weekly
        salary_dates = [today - timedelta(days=28), today - timedelta(days=14)]
        for s_date in salary_dates:
            transactions.append(Transaction(
                account_id=chase_checking.id,
                date=s_date,
                amount=Decimal("2500.00"),
                description="Bi-weekly Direct Deposit Salary",
                merchant_name="Acme Corp",
                category_id=categories["Income"].id,
                notes="Paycheck"
            ))

        # Rent / Mortgage
        transactions.append(Transaction(
            account_id=chase_checking.id,
            date=today - timedelta(days=25),
            amount=Decimal("-1500.00"),
            description="Rent Payment",
            merchant_name="Metropolitan Leasing",
            category_id=categories["Housing"].id,
            notes="Monthly rent"
        ))

        # Utilities
        transactions.append(Transaction(
            account_id=chase_checking.id,
            date=today - timedelta(days=20),
            amount=Decimal("-115.40"),
            description="ConEd Electric Bill",
            merchant_name="ConEd",
            category_id=categories["Utilities"].id,
            notes="Electricity"
        ))
        transactions.append(Transaction(
            account_id=chase_checking.id,
            date=today - timedelta(days=18),
            amount=Decimal("-79.99"),
            description="Verizon Fios Internet",
            merchant_name="Verizon",
            category_id=categories["Utilities"].id,
            notes="Fios Home Internet"
        ))

        # Groceries on checking
        grocery_dates = [today - timedelta(days=26), today - timedelta(days=19), today - timedelta(days=12), today - timedelta(days=5)]
        grocery_amounts = ["84.20", "124.50", "95.10", "112.30"]
        for g_date, g_amount in zip(grocery_dates, grocery_amounts):
            transactions.append(Transaction(
                account_id=chase_checking.id,
                date=g_date,
                amount=Decimal(f"-{g_amount}"),
                description="Whole Foods Market",
                merchant_name="Whole Foods",
                category_id=categories["Food & Dining"].id,
                notes="Weekly groceries"
            ))

        # Vanguard: Dividends
        transactions.append(Transaction(
            account_id=vanguard_brokerage.id,
            date=today - timedelta(days=10),
            amount=Decimal("45.12"),
            description="Vanguard Total Stock Market ETF Dividend",
            merchant_name="Vanguard",
            category_id=categories["Income"].id,
            notes="Quarterly dividends"
        ))

        # Transfer from checking to savings
        transactions.append(Transaction(
            account_id=chase_checking.id,
            date=today - timedelta(days=13),
            amount=Decimal("-200.00"),
            description="Transfer to Savings",
            merchant_name=None,
            category_id=categories["Transfer"].id,
            notes="Monthly savings goal"
        ))
        transactions.append(Transaction(
            account_id=boa_savings.id,
            date=today - timedelta(days=13),
            amount=Decimal("200.00"),
            description="Transfer from Checking",
            merchant_name=None,
            category_id=categories["Transfer"].id,
            notes="Monthly savings goal"
        ))

        # Amex Credit Card: Daily spending
        # Starbucks Coffee
        coffee_dates = [today - timedelta(days=i) for i in [27, 24, 22, 17, 15, 11, 8, 4, 2]]
        for c_date in coffee_dates:
            c_amount = random.choice(["5.50", "6.20", "6.80", "7.15"])
            transactions.append(Transaction(
                account_id=amex_card.id,
                date=c_date,
                amount=Decimal(f"-{c_amount}"),
                description="Starbucks Coffee Shop",
                merchant_name="Starbucks",
                category_id=categories["Food & Dining"].id,
                notes="Morning coffee"
            ))

        # Dining out
        transactions.append(Transaction(
            account_id=amex_card.id,
            date=today - timedelta(days=23),
            amount=Decimal("-45.00"),
            description="Ramen Shop Dinner",
            merchant_name="Ramen Shop",
            category_id=categories["Food & Dining"].id,
            notes="Dinner with friends"
        ))
        transactions.append(Transaction(
            account_id=amex_card.id,
            date=today - timedelta(days=16),
            amount=Decimal("-18.25"),
            description="Chipotle Mexican Grill",
            merchant_name="Chipotle",
            category_id=categories["Food & Dining"].id,
            notes="Lunch"
        ))
        transactions.append(Transaction(
            account_id=amex_card.id,
            date=today - timedelta(days=9),
            amount=Decimal("-68.50"),
            description="Italian Restaurant Bistro",
            merchant_name="Italian Bistro",
            category_id=categories["Food & Dining"].id,
            notes="Date night dinner"
        ))

        # Gas / Transport
        transactions.append(Transaction(
            account_id=amex_card.id,
            date=today - timedelta(days=22),
            amount=Decimal("-42.50"),
            description="Shell Oil Gas Station",
            merchant_name="Shell",
            category_id=categories["Transport"].id,
            notes="Car refuel"
        ))
        transactions.append(Transaction(
            account_id=amex_card.id,
            date=today - timedelta(days=7),
            amount=Decimal("-38.90"),
            description="Shell Oil Gas Station",
            merchant_name="Shell",
            category_id=categories["Transport"].id,
            notes="Car refuel"
        ))
        transactions.append(Transaction(
            account_id=amex_card.id,
            date=today - timedelta(days=14),
            amount=Decimal("-22.10"),
            description="Uber Ride",
            merchant_name="Uber",
            category_id=categories["Transport"].id,
            notes="Ride home"
        ))

        # Shopping
        transactions.append(Transaction(
            account_id=amex_card.id,
            date=today - timedelta(days=21),
            amount=Decimal("-35.99"),
            description="Amazon.com Marketplace",
            merchant_name="Amazon",
            category_id=categories["Shopping"].id,
            notes="Household items"
        ))
        transactions.append(Transaction(
            account_id=amex_card.id,
            date=today - timedelta(days=10),
            amount=Decimal("-125.00"),
            description="Target Retail",
            merchant_name="Target",
            category_id=categories["Shopping"].id,
            notes="Kitchenware and clothes"
        ))
        transactions.append(Transaction(
            account_id=amex_card.id,
            date=today - timedelta(days=3),
            amount=Decimal("-14.99"),
            description="Amazon.com Prime",
            merchant_name="Amazon",
            category_id=categories["Shopping"].id,
            notes="Book purchase"
        ))

        # Entertainment Subscriptions
        transactions.append(Transaction(
            account_id=amex_card.id,
            date=today - timedelta(days=15),
            amount=Decimal("-19.99"),
            description="Netflix Subscription",
            merchant_name="Netflix",
            category_id=categories["Entertainment"].id,
            notes="Streaming subscription"
        ))
        transactions.append(Transaction(
            account_id=amex_card.id,
            date=today - timedelta(days=15),
            amount=Decimal("-14.99"),
            description="Spotify Music Premium",
            merchant_name="Spotify",
            category_id=categories["Entertainment"].id,
            notes="Music subscription"
        ))
        transactions.append(Transaction(
            account_id=amex_card.id,
            date=today - timedelta(days=6),
            amount=Decimal("-32.00"),
            description="AMC Theatres Movie Night",
            merchant_name="AMC Theatres",
            category_id=categories["Entertainment"].id,
            notes="Tickets and popcorn"
        ))

        # Health
        transactions.append(Transaction(
            account_id=amex_card.id,
            date=today - timedelta(days=27),
            amount=Decimal("-25.00"),
            description="Planet Fitness Gym",
            merchant_name="Planet Fitness",
            category_id=categories["Health"].id,
            notes="Monthly gym fee"
        ))
        transactions.append(Transaction(
            account_id=amex_card.id,
            date=today - timedelta(days=12),
            amount=Decimal("-18.45"),
            description="CVS Pharmacy Health",
            merchant_name="CVS Pharmacy",
            category_id=categories["Health"].id,
            notes="First aid supplies"
        ))

        # Uncategorized (to test uncategorized card/pill)
        transactions.append(Transaction(
            account_id=amex_card.id,
            date=today - timedelta(days=1),
            amount=Decimal("-12.00"),
            description="Corner Bodega Vendor",
            merchant_name=None,
            category_id=None,  # Uncategorized
            notes="Snacks"
        ))

        for txn in transactions:
            session.add(txn)
        
        session.commit()
        print(f"🎉 Successfully seeded {len(transactions)} transactions across {len(session.exec(select(Account)).all())} accounts!")

    except Exception as e:
        session.rollback()
        print(f"❌ Error seeding database: {e}")
        raise e
    finally:
        session.close()


if __name__ == "__main__":
    seed_database()
